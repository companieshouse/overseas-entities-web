import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";

import * as config from "../../config";
import {
  ManagingOfficerTypeChoice,
  BeneficialOwnerTypeKey
} from "../../model/beneficial.owner.type.model";
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.redirect(getNextPage(req.body[BeneficialOwnerTypeKey]));
};

export const postSubmit = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.redirect(config.UPDATE_CHECK_YOUR_ANSWERS_URL);
};

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.UPDATE_MANAGING_OFFICER_TYPE_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_REVIEW_URL,
      templateName: config.UPDATE_MANAGING_OFFICER_TYPE_PAGE,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

// With validation in place we will only have 2 choices
const getNextPage = (managingOfficerTypeChoices: ManagingOfficerTypeChoice): string => {
  if (managingOfficerTypeChoices === ManagingOfficerTypeChoice.individual) {
    return config.UPDATE_MANAGING_OFFICER_INDIVIDUAL_URL;
  } else {
    return config.UPDATE_MANAGING_OFFICER_CORPORATE_URL;
  }
};
