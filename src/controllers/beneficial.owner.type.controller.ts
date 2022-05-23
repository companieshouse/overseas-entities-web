import { NextFunction, Request, Response } from "express";

import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";
import {
  BeneficialOwnerTypeChoice,
  ManagingOfficerTypeChoice,
} from "../model/beneficial.owner.type.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_STATEMENTS_URL,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);
  const { selectedOwnerOfficerType } = req.body;

  return res.redirect(getNextPage(selectedOwnerOfficerType));
};

// With validation in place we have got just these 5 possible choices
const getNextPage = (beneficialOwnerTypeChoices?: BeneficialOwnerTypeChoice): string => {
  if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.individual) {
    return config.BENEFICIAL_OWNER_INDIVIDUAL_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.otherLegal) {
    return config.BENEFICIAL_OWNER_OTHER_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.government) {
    return config.BENEFICIAL_OWNER_GOV_URL;
  } else if (beneficialOwnerTypeChoices === ManagingOfficerTypeChoice.corporate) {
    return config.MANAGING_OFFICER_CORPORATE_URL;
  }
  return config.MANAGING_OFFICER_URL;
};
