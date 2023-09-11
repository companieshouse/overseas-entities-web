import { ApplicationData } from "../../model";
import { Request } from "express";
import { logger } from "../../utils/logger";
import { EntityNumberKey } from "../../model/data.types.model";
import { CompanyPersonWithSignificantControl, CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
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
  const transactionId = appData.transaction_id;
  const overseasEntityId = appData.overseas_entity_id;
  const pscs: CompanyPersonsWithSignificantControl = await getCompanyPsc(req, appData[EntityNumberKey] as string);

  if (!pscs || pscs.items?.length === 0) {
    return;
  }

  let boPrivateData: BeneficialOwnersPrivateData | undefined;

  try {
    if (transactionId && overseasEntityId) {
      boPrivateData = await getBeneficialOwnerPrivateData(req, transactionId, overseasEntityId);
      if (!boPrivateData || boPrivateData.boPrivateData.length === 0) {
        logger.info(`No private Beneficial Owner details were retrieved for overseas entity ${appData.entity_number}`);
      }
    }
  } catch (error) {
    logger.errorRequest(req, "No private Beneficial Owner details were retrieved for overseas entity " + appData.entity_number);
  }

  for (const psc of pscs.items) {
    logger.info("Loaded psc " + psc.kind);
    if (psc.ceasedOn !== undefined) { continue; }
    switch (psc.kind) {
        case "individual-beneficial-owner":
          mapBeneficialOwnerIndividual(psc, appData, boPrivateData);
          break;
        case "corporate-entity-beneficial-owner":
          mapBeneficialOwnerOther(psc, appData, boPrivateData);
          break;
        case "legal-person-beneficial-owner":
          mapBeneficialOwnerGov(psc, appData, boPrivateData);
          break;
    }
  }
};

export const mapBeneficialOwnerIndividual = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData, boPrivateData: BeneficialOwnersPrivateData | undefined) => {
  const individualBeneficialOwner = mapPscToBeneficialOwnerTypeIndividual(psc);
  if (individualBeneficialOwner.ch_reference && boPrivateData?.boPrivateData?.length !== undefined && boPrivateData.boPrivateData.length > 0) {
    individualBeneficialOwner.usual_residential_address = mapBoPrivateAddress(boPrivateData, individualBeneficialOwner.ch_reference, false);
  }
  logger.info("Loaded individual Beneficial Owner " + individualBeneficialOwner.id + " is " + individualBeneficialOwner.first_name + ", " + individualBeneficialOwner.last_name);
  appData.update?.review_beneficial_owners_individual?.push(individualBeneficialOwner);
};

export const mapBeneficialOwnerOther = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData, boPrivateData: BeneficialOwnersPrivateData | undefined) => {
  const beneficialOwnerOther = mapPscToBeneficialOwnerOther(psc);
  if (beneficialOwnerOther.ch_reference && boPrivateData?.boPrivateData?.length !== undefined && boPrivateData.boPrivateData.length > 0) {
    beneficialOwnerOther.principal_address = mapBoPrivateAddress(boPrivateData, beneficialOwnerOther.ch_reference, true);
  }
  logger.info("Loaded Beneficial Owner Other " + beneficialOwnerOther.id + " is " + beneficialOwnerOther.name);
  appData.update?.review_beneficial_owners_corporate?.push(beneficialOwnerOther);
};

export const mapBeneficialOwnerGov = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData, boPrivateData: BeneficialOwnersPrivateData | undefined) => {
  const beneficialOwnerGov = mapPscToBeneficialOwnerGov(psc);
  if (beneficialOwnerGov.ch_reference && boPrivateData?.boPrivateData?.length !== undefined && boPrivateData.boPrivateData.length > 0) {
    beneficialOwnerGov.principal_address = mapBoPrivateAddress(boPrivateData, beneficialOwnerGov.ch_reference, true);
  }
  logger.info("Loaded Beneficial Owner Gov " + beneficialOwnerGov.id + " is " + beneficialOwnerGov.name);
  appData.update?.review_beneficial_owners_government_or_public_authority?.push(beneficialOwnerGov);
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
