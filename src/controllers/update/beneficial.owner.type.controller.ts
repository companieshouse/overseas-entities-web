import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../utils/logger";

import * as config from "../../config";
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice
} from "../../model/beneficial.owner.type.model";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { getApplicationData, setApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";
import { EntityNumberKey } from "../../model/data.types.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    if (appData[BeneficialOwnerIndividualKey] === undefined) {
      await getBeneficialOwnerAndManagingOfficerData(req, appData);
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

const getBeneficialOwnerAndManagingOfficerData = async (req: Request, appData: ApplicationData) => {
  const pscData = await getCompanyPsc(req, appData[EntityNumberKey] as string);

  if (pscData) {
    // set beneficial_owners_individual to {} to prevent re-run
    // UAR-337 to update and map response to model
    const session = req.session as Session;
    setApplicationData(session, {}, BeneficialOwnerIndividualKey);
  }
};
