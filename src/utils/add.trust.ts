import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from './logger';
import { getApplicationData } from './application.data';
import { generateTrustId } from './trust/details.mapper';
import { getTrustArray, hasNoBoAssignableToTrust } from './trusts';
import { Trust } from '../model/trust.model';
import * as PageModel from '../model/trust.page.model';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { validationResult } from 'express-validator';
import { isActiveFeature } from './feature.flag';
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";
import { getUrlWithParamsToPath } from './url';
import { checkRelevantPeriod } from './relevant.period';

export const ADD_TRUST_TEXTS = {
  title: 'Trusts associated with the overseas entity',
  subtitle: 'Do you need to add another trust?',
};

type TrustInvolvedPageProperties = {
  templateName: string;
  isUpdate: boolean,
  backLinkUrl?: string,
  pageParams: {
    title: string,
    subtitle: string
  },
  pageData: {
    trustData: Trust[],
    isRelevantPeriod: boolean,
    isAddTrustQuestionToBeShown: boolean
  },
  formData?: PageModel.AddTrust,
  errors?: FormattedValidationErrors,
  url: string,
  isFeatureFlagCeaseTrustsEnabled: boolean
};

const getPageProperties = (
  req: Request,
  isUpdate: boolean,
  formData?: PageModel.AddTrust,
  errors?: FormattedValidationErrors,
): TrustInvolvedPageProperties => {

  const appData = getApplicationData(req.session);

  // note: isUpdate covers both Update and Remove journeys, so when on Remove journey isUpdate will be true.
  return {
    templateName: getPageTemplate(isUpdate),
    backLinkUrl: getBackLinkUrl(isUpdate, req),
    ...appData,
    pageData: {
      trustData: getTrustArray(appData),
      isRelevantPeriod: isUpdate ? checkRelevantPeriod(appData) : false,
      isAddTrustQuestionToBeShown: !isUpdate || !hasNoBoAssignableToTrust(appData)
    },
    pageParams: {
      title: ADD_TRUST_TEXTS.title,
      subtitle: ADD_TRUST_TEXTS.subtitle,
    },
    isUpdate,
    isFeatureFlagCeaseTrustsEnabled: isActiveFeature(config.FEATURE_FLAG_ENABLE_CEASE_TRUSTS),
    formData,
    errors,
    url: getUrl(isUpdate),
  };
};

export const getTrusts = (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean
): void => {

  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const pageProps = getPageProperties(req, isUpdate);

    if (!isUpdate) {
      addActiveSubmissionBasePathToTemplateData(pageProps, req);
    }

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postTrusts = (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean
) => {
  try {
    logger.debugRequest(req, `POST ${getPageTemplate(isUpdate)}`);
    const addNewTrust = req.body["addTrust"];

    // check for errors
    const errorList = validationResult(req);
    const formData: PageModel.AddTrust = req.body as PageModel.AddTrust;
    const appData = getApplicationData(req.session);

    if (!errorList.isEmpty()) {
      const pageProps = getPageProperties(
        req,
        isUpdate,
        formData,
        formatValidationError(errorList.array()),
      );
      if (!isUpdate) {
        addActiveSubmissionBasePathToTemplateData(pageProps, req);
      }
      return res.render(pageProps.templateName, pageProps);
    }

    if (addNewTrust === "addTrustYes") {
      const newTrustId = generateTrustId(appData);
      return res.redirect(`${newTrustPage(isUpdate, req)}/${newTrustId}`);
    } else if (addNewTrust === "preRegistration") {
      const newTrustId = generateTrustId(appData);
      return res.redirect(`${newTrustPage(isUpdate, req)}/${newTrustId}${config.RELEVANT_PERIOD_QUERY_PARAM}`);
    } else {
      return res.redirect(nextPage(isUpdate, req));
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const newTrustPage = (isUpdate: boolean, req: Request) => {
  if (isUpdate){
    return config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE;
  } else {
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      return getUrlWithParamsToPath(config.TRUST_ENTRY_WITH_PARAMS_URL, req);
    }
    return config.TRUST_DETAILS_URL;
  }
};

const nextPage = (isUpdate: boolean, req: Request) => {
  if (isUpdate) {
    return config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL;
  } else {
    return isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
      ? getUrlWithParamsToPath(config.CHECK_YOUR_ANSWERS_WITH_PARAMS_URL, req)
      : config.CHECK_YOUR_ANSWERS_URL;
  }
};

const getPageTemplate = (isUpdate: boolean) => {
  if (isUpdate){
    return config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_PAGE;
  } else {
    return config.ADD_TRUST_PAGE;
  }
};

const getBackLinkUrl = (isUpdate: boolean, req: Request) => {
  if (isUpdate){
    return config.UPDATE_BENEFICIAL_OWNER_TYPE_URL;
  } else {
    return isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
      ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
      : config.BENEFICIAL_OWNER_TYPE_URL;
  }
};

const getUrl = (isUpdate: boolean) => {
  if (isUpdate){
    return config.UPDATE_AN_OVERSEAS_ENTITY_URL;
  } else {
    return config.REGISTER_AN_OVERSEAS_ENTITY_URL;
  }
};
