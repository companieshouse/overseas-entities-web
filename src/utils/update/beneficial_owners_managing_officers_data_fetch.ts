import { ApplicationData } from "../../model";
import { Request } from "express";
import { logger } from "../../utils/logger";
import { EntityNumberKey } from "../../model/data.types.model";
import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { ManagingOfficerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { mapToManagingOfficer, mapToManagingOfficerCorporate, mapMoPrivateAddress } from "../../utils/update/managing.officer.mapper";
import { getCompanyOfficers } from "../../service/company.managing.officer.service";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";
import { mapPscToBeneficialOwnerGov, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerTypeIndividual } from "../../utils/update/psc.to.beneficial.owner.type.mapper";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
// import { getManagingOfficersPrivateData } from "../../service/private.overseas.entity.details";

export const retrieveBoAndMoData = async (req: Request, appData: ApplicationData) => {
  if (!hasFetchedBoAndMoData(appData)) {
    initialiseBoAndMoUpdateAppData(appData);
    if (appData.update) {
      await retrieveBeneficialOwners(req, appData);
      await retrieveManagingOfficers(req, appData);
      appData.update.bo_mo_data_fetched = true;
    }
  }
};

const hasFetchedBoAndMoData = (appData: ApplicationData) => appData?.update?.bo_mo_data_fetched ?? false;

const initialiseBoAndMoUpdateAppData = (appData: ApplicationData) => {
  if (!appData.update) {
    appData.update = {};
  }

  appData.update.review_beneficial_owners_individual = [];
  appData.update.review_beneficial_owners_corporate = [];
  appData.update.review_beneficial_owners_government_or_public_authority = [];
  appData.update.review_managing_officers_individual = [];
  appData.update.review_managing_officers_corporate = [];
};

export const retrieveBeneficialOwners = async (req: Request, appData: ApplicationData) => {
  const pscs: CompanyPersonsWithSignificantControl = await getCompanyPsc(req, appData[EntityNumberKey] as string);
  if (pscs) {
    for (const psc of (pscs.items || [])) {
      logger.info("Loaded psc " + psc.kind);
      if (psc.ceasedOn === undefined) {
        if (psc.kind === "individual-beneficial-owner") {
          const individualBeneficialOwner = mapPscToBeneficialOwnerTypeIndividual(psc);
          logger.info("Loaded individual Beneficial Owner " + individualBeneficialOwner.id + " is " + individualBeneficialOwner.first_name + ", " + individualBeneficialOwner.last_name);
          appData.update?.review_beneficial_owners_individual?.push(individualBeneficialOwner);
        } else if (psc.kind === "corporate-entity-beneficial-owner") {
          const beneficialOwnerOther = mapPscToBeneficialOwnerOther(psc);
          logger.info("Loaded Beneficial Owner Other " + beneficialOwnerOther.id + " is " + beneficialOwnerOther.name);
          appData.update?.review_beneficial_owners_corporate?.push(beneficialOwnerOther);
        } else if (psc.kind === "legal-person-beneficial-owner") {
          const beneficialOwnerGov = mapPscToBeneficialOwnerGov(psc);
          logger.info("Loaded Beneficial Owner Gov " + beneficialOwnerGov.id + " is " + beneficialOwnerGov.name);
          appData.update?.review_beneficial_owners_government_or_public_authority?.push(beneficialOwnerGov);
        }
      }
    }
  }
};

export const retrieveManagingOfficers = async (req: Request, appData: ApplicationData) => {

  const companyOfficers = await getCompanyOfficers(req, appData[EntityNumberKey] as string);

  if (!companyOfficers || companyOfficers.items?.length === 0) {
    return;
  }

  let moPrivateData: ManagingOfficerPrivateData[] | undefined;
  /*
  const transactionId = appData.transaction_id;
  const overseasEntityId = appData.overseas_entity_id;
  try {
    if (transactionId && overseasEntityId) {
      moPrivateData = await getManagingOfficersPrivateData(req, transactionId, overseasEntityId);
      if (!moPrivateData || moPrivateData.length === 0) {
        logger.info(`No private Managing Officer details were retrieved for overseas entity ${appData.entity_number}`);
      }
    }
  } catch (error) {
    logger.errorRequest(req, `Private Managing Officer details could not be retrieved for overseas entity ${appData.entity_number}`);
  }
  */
  for (const officer of companyOfficers.items) {
    logger.info(`Loaded officer ${officer.officerRole}`);

    if (officer.resignedOn) {continue;} // Skip over resigned officers

    switch (officer.officerRole) {
        case "managing-officer":
          handleIndividualManagingOfficer(officer, moPrivateData, appData);
          break;
        case "corporate-managing-officer":
          handleCorporateManagingOfficer(officer, appData);
          break;
    }
  }
};

const handleIndividualManagingOfficer = (
  officer: CompanyOfficer,
  moPrivateData: ManagingOfficerPrivateData[] | undefined,
  appData: ApplicationData
) => {
  const managingOfficer = mapToManagingOfficer(officer);

  if (managingOfficer.ch_reference && moPrivateData?.length !== undefined && moPrivateData.length > 0) {
    managingOfficer.usual_residential_address = mapMoPrivateAddress(moPrivateData, managingOfficer.ch_reference);
  }

  logger.info(`Loaded Managing Officer ${managingOfficer.id} is ${managingOfficer.first_name}, ${managingOfficer.last_name}`);
  appData.update?.review_managing_officers_individual?.push(managingOfficer);
};

const handleCorporateManagingOfficer = (officer: CompanyOfficer, appData: ApplicationData) => {
  const managingOfficerCorporate = mapToManagingOfficerCorporate(officer);
  logger.info(`Loaded Corporate Managing Officer ${managingOfficerCorporate.id} is ${managingOfficerCorporate.name}`);
  appData.update?.review_managing_officers_corporate?.push(managingOfficerCorporate);
};
