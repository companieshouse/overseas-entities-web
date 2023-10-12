import { NextFunction, Request, Response } from "express";

import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { logger } from "../utils/logger";
import { checkEntityRequiresTrusts, getTrustLandingUrl } from "../utils/trusts";
import * as config from "../config";
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice,
} from "../model/beneficial.owner.type.model";
import { isActiveFeature } from '../utils/feature.flag';
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const requiresTrusts: boolean = checkEntityRequiresTrusts(appData);

    logger.infoRequest(req, `${config.BENEFICIAL_OWNER_TYPE_PAGE} requiresTrusts=${requiresTrusts}`);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
        FEATURE_FLAG_ENABLE_REDIS_REMOVAL: true,
        addButtonActionWithParams: getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req),
        noMoreToAddButtonActionWithParams: getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL, req),
        beneficialOwnerIndividualUrlWithParams: getUrlWithParamsToPath(config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL, req),
        backLinkUrl: config.BENEFICIAL_OWNER_STATEMENTS_URL,
        templateName: config.BENEFICIAL_OWNER_TYPE_PAGE,
        requiresTrusts,
        ...appData,
      });
    }

    return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_STATEMENTS_URL,
      templateName: config.BENEFICIAL_OWNER_TYPE_PAGE,
      requiresTrusts,
      ...appData,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.redirect(getNextPage(req, req.body[BeneficialOwnerTypeKey]));
};

export const postSubmit = (req: Request, res: Response) => {
  const appData: ApplicationData = getApplicationData(req.session);
  const requiresTrusts: boolean = checkEntityRequiresTrusts(appData);
  let nextPageUrl = config.CHECK_YOUR_ANSWERS_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.CHECK_YOUR_ANSWERS_WITH_PARAMS_URL, req);
  }
  if (requiresTrusts) {
    nextPageUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB)
      ? getTrustLandingUrl(appData)
      : config.TRUST_INFO_URL;
  }
  return res.redirect(nextPageUrl);
};

// With validation in place we have got just these 5 possible choices
const getNextPage = (req: Request, beneficialOwnerTypeChoices?: BeneficialOwnerTypeChoice | ManagingOfficerTypeChoice): string => {
  if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.individual) {
    let nextPageUrl = config.BENEFICIAL_OWNER_INDIVIDUAL_URL;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
      nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL, req);
    }

    return nextPageUrl;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.otherLegal) {
    return config.BENEFICIAL_OWNER_OTHER_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.government) {
    return config.BENEFICIAL_OWNER_GOV_URL;
  } else if (beneficialOwnerTypeChoices === ManagingOfficerTypeChoice.corporate) {
    return config.MANAGING_OFFICER_CORPORATE_URL;
  }
  return config.MANAGING_OFFICER_URL;
};
