import { ApplicationData } from "../../model";
import { Request } from "express";
import { logger } from "../../utils/logger";
import { EntityNumberKey } from "../../model/data.types.model";
import { CompanyPersonWithSignificantControl, CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { mapToManagingOfficer, mapToManagingOfficerCorporate } from "../../utils/update/managing.officer.mapper";
import { getCompanyOfficers } from "../../service/company.managing.officer.service";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";
import { mapPscToBeneficialOwnerGov, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerTypeIndividual } from "../../utils/update/psc.to.beneficial.owner.type.mapper";

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

  if (!pscs || pscs.items?.length === 0) {
    return;
  }

  for (const psc of pscs.items) {
    logger.info("Loaded psc " + psc.kind);
    if (psc.ceasedOn !== undefined) { continue; }
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

export const mapBeneficialOwnerIndividual = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData) => {
  const individualBeneficialOwner = mapPscToBeneficialOwnerTypeIndividual(psc);
  logger.info("Loaded individual Beneficial Owner " + individualBeneficialOwner.id);
  appData.update?.review_beneficial_owners_individual?.push(individualBeneficialOwner);
};

export const mapBeneficialOwnerOther = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData) => {
  const beneficialOwnerOther = mapPscToBeneficialOwnerOther(psc);
  logger.info("Loaded Beneficial Owner Other " + beneficialOwnerOther.id);
  appData.update?.review_beneficial_owners_corporate?.push(beneficialOwnerOther);
};

export const mapBeneficialOwnerGov = (psc: CompanyPersonWithSignificantControl, appData: ApplicationData) => {
  const beneficialOwnerGov = mapPscToBeneficialOwnerGov(psc);
  logger.info("Loaded Beneficial Owner Gov " + beneficialOwnerGov.id);
  appData.update?.review_beneficial_owners_government_or_public_authority?.push(beneficialOwnerGov);
};
