import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice
} from "../../model/beneficial.owner.type.model";

import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { EntityNumberKey } from "../../model/data.types.model";
import { mapToManagingOfficer, mapToManagingOfficerCorporate } from "../../utils/update/managing.officer.mapper";
import { getCompanyOfficers } from "../../service/company.managing.officer.service";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";
import { hasFetchedBoAndMoData, setFetchedBoMoData } from "../../utils/update/beneficial_owners_managing_officers_data_fetch";
import { mapPscToBeneficialOwnerGov, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerTypeIndividual } from "../../utils/update/psc.to.beneficial.owner.type.mapper";

import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    if (!hasFetchedBoAndMoData(appData)) {
      if (!appData.update) {
        appData.update = {};
      }
      appData.update.review_managing_officers_individual = [];
      appData.update.review_managing_officers_corporate = [];
      appData.update.review_beneficial_owners_individual = [];
      appData.update.review_beneficial_owners_corporate = [];
      appData.update.review_beneficial_owners_government_or_public_authority = [];

      await retrieveManagingOfficers(req, appData);
      await retrieveBeneficialOwners(req, appData);
      setFetchedBoMoData(appData);
    }

    return res.render(config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_REVIEW_URL,
      templateName: config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
      ...appData,
      noLists: true
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.redirect(getNextPage(req.body[BeneficialOwnerTypeKey]));
};

export const postSubmit = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.redirect(config.UPDATE_CHECK_YOUR_ANSWERS_URL);
};

const getNextPage = (beneficialOwnerTypeChoices: BeneficialOwnerTypeChoice | ManagingOfficerTypeChoice): string => {
  switch (beneficialOwnerTypeChoices) {
      case BeneficialOwnerTypeChoice.government:
        return config.UPDATE_BENEFICIAL_OWNER_GOV_URL;
      case BeneficialOwnerTypeChoice.otherLegal:
        return config.UPDATE_BENEFICIAL_OWNER_OTHER_URL;
      case ManagingOfficerTypeChoice.corporate:
        return config.UPDATE_MANAGING_OFFICER_CORPORATE_URL;
      case ManagingOfficerTypeChoice.individual:
        return config.UPDATE_MANAGING_OFFICER_URL;
      default:
        return config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL;
  }
};

const retrieveManagingOfficers = async (req: Request, appData: ApplicationData) => {
  const companyOfficers = await getCompanyOfficers(req, appData[EntityNumberKey] as string);
  if (companyOfficers) {
    for (const officer of (companyOfficers.items || [])) {
      if (officer.officerRole === "secretary") {
        const managingOfficer = mapToManagingOfficer(officer);
        if (!managingOfficer.resigned_on) {
          logger.info("Loaded Managing Officer " + managingOfficer.id + " is " + managingOfficer.first_name + ", " + managingOfficer.last_name);
          appData.update?.review_managing_officers_individual?.push(managingOfficer);
        }
      } else if (officer.officerRole === "director") {
        const managingOfficerCorporate = mapToManagingOfficerCorporate(officer);
        if (!managingOfficerCorporate.resigned_on) {
          logger.info("Loaded Corporate Managing Officer " + managingOfficerCorporate.id + " is " + managingOfficerCorporate.name);
          appData.update?.review_managing_officers_corporate?.push(managingOfficerCorporate);
        }
      }
    }
  }
};

const retrieveBeneficialOwners = async (req: Request, appData: ApplicationData) => {
  const pscs: CompanyPersonsWithSignificantControl = await getCompanyPsc(req, appData[EntityNumberKey] as string);
  if (pscs) {
    for (const psc of (pscs.items || [])) {
      if (psc.kind === "individual-person-with-significant-control"){
        const individualBeneficialOwner = mapPscToBeneficialOwnerTypeIndividual(psc);
        if (!individualBeneficialOwner.ceased_date) {
          logger.info("Loaded individual Beneficial Owner " + individualBeneficialOwner.id + " is " + individualBeneficialOwner.first_name + ", " + individualBeneficialOwner.last_name);
          appData.update?.review_beneficial_owners_individual?.push(individualBeneficialOwner);
        }
      } else if (psc.kind === "corporate-entity-beneficial-owner") {
        const beneficialOwnerOther = mapPscToBeneficialOwnerOther(psc);
        if (!beneficialOwnerOther.ceased_date) {
          logger.info("Loaded Beneficial Owner Other " + beneficialOwnerOther.id + " is " + beneficialOwnerOther.name);
          appData.update?.review_beneficial_owners_corporate?.push(beneficialOwnerOther);
        }
      } else if (psc.kind === "legal-person-with-significant-control") {
        const beneficialOwnerGov = mapPscToBeneficialOwnerGov(psc);
        if (!beneficialOwnerGov.ceased_date) {
          logger.info("Loaded Beneficial Owner Gov " + beneficialOwnerGov.id + " is " + beneficialOwnerGov.name);
          appData.beneficial_owners_government_or_public_authority?.push(beneficialOwnerGov);
        }
      }
    }
  }
};
