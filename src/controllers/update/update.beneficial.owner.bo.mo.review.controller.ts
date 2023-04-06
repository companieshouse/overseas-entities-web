import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { hasFetchedBoAndMoData, setFetchedBoMoData } from "../../utils/update/beneficial_owners_managing_officers_data_fetch";
import { getCompanyOfficers } from "../../service/company.managing.officer.service";
import { EntityNumberKey } from "../../model/data.types.model";
import { mapToManagingOfficer, mapToManagingOfficerCorporate } from "../../utils/update/managing.officer.mapper";
import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";
import { mapPscToBeneficialOwnerTypeIndividual, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerGov } from "../../utils/update/psc.to.beneficial.owner.type.mapper";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    if (!hasFetchedBoAndMoData(appData)) {
      if (!appData.update) {
        appData.update = {};
      }
      appData.update.review_beneficial_owners_individual = [];
      appData.update.review_beneficial_owners_corporate = [];
      appData.update.review_beneficial_owners_government_or_public_authority = [];

      await retrieveBeneficialOwners(req, appData);
      await retrieveManagingOfficers(req, appData);
      setFetchedBoMoData(appData);
    }

    return res.render(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE, {
      backLinkUrl: config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
      templateName: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE,
      appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    if(appData.update?.review_beneficial_owners_individual?.length){
      return res.redirect(config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL)
    } else {
        return res.redirect(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const retrieveManagingOfficers = async (req: Request, appData: ApplicationData) => {
  const companyOfficers = await getCompanyOfficers(req, appData[EntityNumberKey] as string);
  if (companyOfficers) {
    for (const officer of (companyOfficers.items || [])) {
      if (officer.officerRole === "secretary") {
        const managingOfficer = mapToManagingOfficer(officer);
        logger.info("Loaded Managing Officer " + managingOfficer.id + " is " + managingOfficer.first_name + ", " + managingOfficer.last_name);
      } else if (officer.officerRole === "director") {
        const managingOfficerCorporate = mapToManagingOfficerCorporate(officer);
        logger.info("Loaded Corporate Managing Officer " + managingOfficerCorporate.id + " is " + managingOfficerCorporate.name);
      }
    }
  }
};

export const retrieveBeneficialOwners = async (req: Request, appData: ApplicationData) => {
  const pscs: CompanyPersonsWithSignificantControl = await getCompanyPsc(req, appData[EntityNumberKey] as string);
  if (pscs) {
    for (const psc of (pscs.items || [])) {
      if (psc.kind === "individual-person-with-significant-control"){
        const individualBeneficialOwner = mapPscToBeneficialOwnerTypeIndividual(psc);
        logger.info("Loaded individual Beneficial Owner " + individualBeneficialOwner.id + " is " + individualBeneficialOwner.first_name + ", " + individualBeneficialOwner.last_name);
        appData.update?.review_beneficial_owners_individual?.push(individualBeneficialOwner);
      } else if (psc.kind === "corporate-entity-beneficial-owner") {
        const beneficialOwnerOther = mapPscToBeneficialOwnerOther(psc);
        logger.info("Loaded Beneficial Owner Other " + beneficialOwnerOther.id + " is " + beneficialOwnerOther.name);
      } else if (psc.kind === "legal-person-with-significant-control") {
        const beneficialOwnerGov = mapPscToBeneficialOwnerGov(psc);
        logger.info("Loaded Beneficial Owner Gov " + beneficialOwnerGov.id + " is " + beneficialOwnerGov.name);
      }
    }
  }
};