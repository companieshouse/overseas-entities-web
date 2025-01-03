import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { isActiveFeature } from '../utils/feature.flag';
import { getUrlWithParamsToPath } from "../utils/url";
import { getApplicationData } from "../utils/application.data";

import { checkEntityRequiresTrusts, getTrustLandingUrl } from "../utils/trusts";

import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice,
} from "../model/beneficial.owner.type.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req);
    const requiresTrusts: boolean = checkEntityRequiresTrusts(appData);

    logger.infoRequest(req, `${config.BENEFICIAL_OWNER_TYPE_PAGE} requiresTrusts=${requiresTrusts}`);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
        // Even though the value of this feature flag is available in the template via the OE_CONFIGS variable, passing it in
        // like this enables unit tests to assert different outcomes, based on whether it is set or not
        FEATURE_FLAG_ENABLE_REDIS_REMOVAL: true,
        activeSubmissionBasePath: getUrlWithParamsToPath(config.ACTIVE_SUBMISSION_BASE_PATH, req),
        backLinkUrl: getUrlWithParamsToPath(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL, req),
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
  return res.redirect(getNextPage(req));
};

export const postSubmit = async (req: Request, res: Response) => {

  const appData: ApplicationData = await getApplicationData(req);
  const requiresTrusts: boolean = checkEntityRequiresTrusts(appData);

  let nextPageUrl = config.CHECK_YOUR_ANSWERS_URL;

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(config.CHECK_YOUR_ANSWERS_WITH_PARAMS_URL, req);
  }

  if (requiresTrusts) {
    nextPageUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB)
      ? getTrustLandingUrl(appData, req)
      : config.TRUST_INFO_URL;
  }

  return res.redirect(nextPageUrl);

};

// With validation in place we have got just these 5 possible choices
const getNextPage = (req: Request): string => {

  const beneficialOwnerTypeChoices: BeneficialOwnerTypeChoice | ManagingOfficerTypeChoice = req.body[BeneficialOwnerTypeKey];

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.individual) {
      return getUrlWithParamsToPath(config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL, req);
    } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.otherLegal) {
      return getUrlWithParamsToPath(config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL, req);
    } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.government) {
      return getUrlWithParamsToPath(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL, req);
    } else if (beneficialOwnerTypeChoices === ManagingOfficerTypeChoice.corporate) {
      return getUrlWithParamsToPath(config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL, req);
    }
    return getUrlWithParamsToPath(config.MANAGING_OFFICER_WITH_PARAMS_URL, req);
  } else {
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
  }
};
