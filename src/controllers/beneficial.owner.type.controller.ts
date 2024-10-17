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
import { beneficialOwnersTypeEmptyNOCList } from "../validation/async";
import { FormattedValidationErrors, formatValidationError, } from "../middleware/validation.middleware";
import { ValidationError } from "express-validator";
import { BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import { BeneficialOwnerGovKey } from "../model/beneficial.owner.gov.model";
import { NonLegalFirmNoc } from "../model/data.types.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return await renderPage(req, res);
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
  const appData: ApplicationData = await getApplicationData(req.session);
  const requiresTrusts: boolean = checkEntityRequiresTrusts(appData);
  let nextPageUrl = config.CHECK_YOUR_ANSWERS_URL;

  const errors = await getValidationErrors(appData, req);

  if (errors.length) {
    return renderPage(req, res, formatValidationError(errors));
  }

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(config.CHECK_YOUR_ANSWERS_WITH_PARAMS_URL, req);
  }

  if (requiresTrusts) {
    nextPageUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB)
      ? getTrustLandingUrl(appData, req)
      : config.TRUST_INFO_URL;
  }

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)) {
    logger.debugRequest(req, "Removing old NOCs");
    appData?.[BeneficialOwnerIndividualKey]?.forEach(boi => { delete boi[NonLegalFirmNoc]; });
    appData?.[BeneficialOwnerOtherKey]?.forEach(boo => { delete boo[NonLegalFirmNoc]; });
    appData?.[BeneficialOwnerGovKey]?.forEach(bog => { delete bog[NonLegalFirmNoc]; });
  }

  return res.redirect(nextPageUrl);
};

// With validation in place we have got just these 5 possible choices
const getNextPage = (req: Request): string => {
  const beneficialOwnerTypeChoices: BeneficialOwnerTypeChoice | ManagingOfficerTypeChoice = req.body[BeneficialOwnerTypeKey];

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
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

// Get validation errors that depend on an asynchronous request
const getValidationErrors = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const beneficialOwnersTypeEmptyNOCListErrors = await beneficialOwnersTypeEmptyNOCList(req, appData);

  return [...beneficialOwnersTypeEmptyNOCListErrors];
};

const renderPage = async (req: Request, res: Response, errors?: FormattedValidationErrors) => {
  const appData: ApplicationData = await getApplicationData(req.session);
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
      errors,
    });
  }

  return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_STATEMENTS_URL,
    templateName: config.BENEFICIAL_OWNER_TYPE_PAGE,
    requiresTrusts,
    ...appData,
    errors,
  });
};
