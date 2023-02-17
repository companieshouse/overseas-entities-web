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

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_REVIEW_URL,
      templateName: config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
      appData
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

const getNextPage = (beneficialOwnerTypeChoices: BeneficialOwnerTypeChoice): string => {
  if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.government) {
    return config.UPDATE_BENEFICIAL_OWNER_GOV_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.otherLegal) {
    return config.UPDATE_BENEFICIAL_OWNER_OTHER_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.individual) {
    return config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL;
  } else if (beneficialOwnerTypeChoices === ManagingOfficerTypeChoice.individual) {
    return config.UPDATE_MANAGING_OFFICER_INDIVIDUAL_URL;
  } else {
    return config.UPDATE_MANAGING_OFFICER_CORPORATE_URL;
  }
};
