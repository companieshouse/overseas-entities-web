import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";

import * as config from "../../config";
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice
} from "../../model/beneficial.owner.type.model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { getApplicationData, setApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { EntityNumberKey } from "../../model/data.types.model";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";
import { hasFetchedBoAndMoData, setFetchedBoMoData } from "../../utils/update/beneficial_owners_managing_officers_data_fetch";
import { mapPscToBeneficialOwnerGov, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerTypeIndividual } from "../../utils/update/psc.to.beneficial.owner.type.mapper";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    if (!hasFetchedBoAndMoData(appData)) {
      await retrieveBeneficialOwners(req, appData);
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

const retrieveBeneficialOwners = async (req: Request, appData: ApplicationData) => {
  const session = req.session as Session;
  const pscs: CompanyPersonsWithSignificantControl = await getCompanyPsc(req, appData[EntityNumberKey] as string);
  if (pscs !== undefined) {
    for (const psc of (pscs.items || [])) {
      if (psc.kind === "individual-person-with-significant-control"){
        const beneficialOwnerI: BeneficialOwnerIndividual = mapPscToBeneficialOwnerTypeIndividual(psc);
        setApplicationData(session, beneficialOwnerI, BeneficialOwnerIndividualKey);
      } else if (psc.kind === "corporate-entity-beneficial-owner") {
        const beneficialOwnerOther: BeneficialOwnerOther = mapPscToBeneficialOwnerOther(psc);
        setApplicationData(session, beneficialOwnerOther, BeneficialOwnerOtherKey);
      } else if (psc.kind === "legal-person-with-significant-control") {
        const beneficialOwnerGov: BeneficialOwnerGov = mapPscToBeneficialOwnerGov(psc);
        setApplicationData(session, beneficialOwnerGov, BeneficialOwnerGovKey);
      }
    }
  } else {
    setFetchedBoMoData(appData);
  }
};
