import { ApplicationData } from "../../model";
import { Request } from "express";
import { logger } from "../../utils/logger";
import { EntityNumberKey } from "../../model/data.types.model";
import { CompanyPersonWithSignificantControl, CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { mapToManagingOfficer, mapToManagingOfficerCorporate } from "../../utils/update/managing.officer.mapper";
import { getCompanyOfficers } from "../../service/company.managing.officer.service";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";
import { mapPscToBeneficialOwnerGov, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerTypeIndividual } from "../../utils/update/psc.to.beneficial.owner.type.mapper";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

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

  if (pscs === undefined || pscs.items === undefined || pscs.items.length === 0) {
    return;
  }

  for (const psc of pscs.items) {
    logger.info("Loaded psc " + psc.kind);
    if (psc.ceasedOn) { continue; }
    switch (psc.kind) {
        case "individual-beneficial-owner":
          mapBeneficialOwnerIndividual(psc, appData);
          break;
        case "corporate-entity-beneficial-owner":
          mapBeneficialOwnerOther(psc, appData);
          break;
        case "legal-person-beneficial-owner":
          mapBeneficialOwnerGov(psc, appData);
          break;
    }
  }
};

export const retrieveManagingOfficers = async (req: Request, appData: ApplicationData) => {

  const companyOfficers = await getCompanyOfficers(req, appData[EntityNumberKey] as string);

  if (companyOfficers === undefined || companyOfficers.items === undefined || companyOfficers.items.length === 0) {
    return;
  }

  for (const officer of companyOfficers.items) {
    logger.info(`Loaded officer ${officer.officerRole}`);

    if (officer.resignedOn) {continue;} // Skip over resigned officers

    switch (officer.officerRole) {
        case "managing-officer":
          handleIndividualManagingOfficer(officer, appData);
          break;
        case "corporate-managing-officer":
          handleCorporateManagingOfficer(officer, appData);
          break;
    }
  }
};

const mapBeneficialOwnerIndividual = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData) => {
  const individualBeneficialOwner = mapPscToBeneficialOwnerTypeIndividual(psc);
  logger.info("Loaded individual Beneficial Owner " + individualBeneficialOwner.id);
  appData.update?.review_beneficial_owners_individual?.push(individualBeneficialOwner);
};

const mapBeneficialOwnerOther = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData) => {
  const beneficialOwnerOther = mapPscToBeneficialOwnerOther(psc);
  logger.info("Loaded Beneficial Owner Other " + beneficialOwnerOther.id);
  appData.update?.review_beneficial_owners_corporate?.push(beneficialOwnerOther);
};

const mapBeneficialOwnerGov = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData) => {
  const beneficialOwnerGov = mapPscToBeneficialOwnerGov(psc);
  logger.info("Loaded Beneficial Owner Gov " + beneficialOwnerGov.id);
  appData.update?.review_beneficial_owners_government_or_public_authority?.push(beneficialOwnerGov);
};

const handleIndividualManagingOfficer = (officer: CompanyOfficer, appData: ApplicationData) => {
  const managingOfficer = mapToManagingOfficer(officer);
  logger.info(`Loaded Managing Officer ${managingOfficer.id}`);
  appData.update?.review_managing_officers_individual?.push(managingOfficer);
};

const handleCorporateManagingOfficer = (officer: CompanyOfficer, appData: ApplicationData) => {
  const managingOfficerCorporate = mapToManagingOfficerCorporate(officer);
  logger.info(`Loaded Corporate Managing Officer ${managingOfficerCorporate.id}`);
  appData.update?.review_managing_officers_corporate?.push(managingOfficerCorporate);
};
