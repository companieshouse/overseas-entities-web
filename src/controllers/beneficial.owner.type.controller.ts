import { NextFunction, Request, Response } from "express";

import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { isActiveFeature } from "../utils/feature.flag";
import { logger } from "../utils/logger";
import { checkEntityHasTrusts } from "../utils/trusts";
import * as config from "../config";
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice,
} from "../model/beneficial.owner.type.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    let hasTrusts: boolean = false;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUST_INFO_16062022)) {
      hasTrusts = checkEntityHasTrusts(appData);
    }

    logger.infoRequest(req, `${config.BENEFICIAL_OWNER_TYPE_PAGE} hasTrusts=${hasTrusts}`);

    return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_STATEMENTS_URL,
      templateName: config.BENEFICIAL_OWNER_TYPE_PAGE,
      hasTrusts,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

  return res.redirect(getNextPage(req.body[BeneficialOwnerTypeKey]));
};

// With validation in place we have got just these 5 possible choices
const getNextPage = (beneficialOwnerTypeChoices?: BeneficialOwnerTypeChoice | ManagingOfficerTypeChoice): string => {
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
