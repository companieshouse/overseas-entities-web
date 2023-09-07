import { ApplicationData } from "../../model";
import { Request } from "express";
import { logger } from "../../utils/logger";
import { EntityNumberKey } from "../../model/data.types.model";
import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { mapToManagingOfficer, mapToManagingOfficerCorporate } from "../../utils/update/managing.officer.mapper";
import { getCompanyOfficers } from "../../service/company.managing.officer.service";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";
import { mapBoPrivateAddress, mapPscToBeneficialOwnerGov, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerTypeIndividual } from "../../utils/update/psc.to.beneficial.owner.type.mapper";
import { getBeneficialOwnerPrivateData } from "../../service/private.overseas.entity.details";
import { BeneficialOwnersPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";

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

  const boPrivateData = await getBoPrivateData(req, appData);

  if (pscs) {
    for (const psc of (pscs.items || [])) {
      logger.info("Loaded psc " + psc.kind);
      if (psc.ceasedOn === undefined) {
        if (psc.kind === "individual-beneficial-owner") {
          const individualBeneficialOwner = mapPscToBeneficialOwnerTypeIndividual(psc);
          individualBeneficialOwner.usual_residential_address = mapBoPrivateAddress(boPrivateData, individualBeneficialOwner.ch_reference!);
          logger.info("Loaded individual Beneficial Owner " + individualBeneficialOwner.id + " is " + individualBeneficialOwner.first_name + ", " + individualBeneficialOwner.last_name);
          appData.update?.review_beneficial_owners_individual?.push(individualBeneficialOwner);
        } else if (psc.kind === "corporate-entity-beneficial-owner") {
          const beneficialOwnerOther = mapPscToBeneficialOwnerOther(psc);
          logger.info("Loaded Beneficial Owner Other " + beneficialOwnerOther.id + " is " + beneficialOwnerOther.name);
          beneficialOwnerOther.principal_address = mapBoPrivateAddress(boPrivateData, beneficialOwnerOther.ch_reference!);
          appData.update?.review_beneficial_owners_corporate?.push(beneficialOwnerOther);
        } else if (psc.kind === "legal-person-beneficial-owner") {
          const beneficialOwnerGov = mapPscToBeneficialOwnerGov(psc);
          logger.info("Loaded Beneficial Owner Gov " + beneficialOwnerGov.id + " is " + beneficialOwnerGov.name);
          beneficialOwnerGov.principal_address = mapBoPrivateAddress(boPrivateData, beneficialOwnerGov.ch_reference!);
          appData.update?.review_beneficial_owners_government_or_public_authority?.push(beneficialOwnerGov);
        }
      }
    }
  }
};

export const retrieveManagingOfficers = async (req: Request, appData: ApplicationData) => {
  const companyOfficers = await getCompanyOfficers(req, appData[EntityNumberKey] as string);
  if (companyOfficers) {
    for (const officer of (companyOfficers.items || [])) {
      logger.info("Loaded officer " + officer.officerRole);
      if (officer.resignedOn === undefined) {
        if (officer.officerRole === "managing-officer") {
          const managingOfficer = mapToManagingOfficer(officer);
          logger.info("Loaded Managing Officer " + managingOfficer.id + " is " + managingOfficer.first_name + ", " + managingOfficer.last_name);
          appData.update?.review_managing_officers_individual?.push(managingOfficer);
        } else if (officer.officerRole === "corporate-managing-officer") {
          const managingOfficerCorporate = mapToManagingOfficerCorporate(officer);
          logger.info("Loaded Corporate Managing Officer " + managingOfficerCorporate.id + " is " + managingOfficerCorporate.name);
          appData.update?.review_managing_officers_corporate?.push(managingOfficerCorporate);
        }
      }
    }
  }
};

export const getBoPrivateData = async (req: Request, appData: ApplicationData): Promise<BeneficialOwnersPrivateData> => {
  const transactionId = appData.transaction_id;
  const overseasEntityId = appData.overseas_entity_id;
  let boPrivateData: BeneficialOwnersPrivateData = {
    boPrivateData: []
  };

  if (transactionId && overseasEntityId){
    try {
      boPrivateData = await getBeneficialOwnerPrivateData(req, transactionId, overseasEntityId) as BeneficialOwnersPrivateData;
    } catch (error) {
      logger.errorRequest(req, "Private Beneficial Owner details could not be retrieved for overseas entity " + appData.entity_number);
    }
  }
  return boPrivateData;
};
