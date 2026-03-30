import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import * as PageModel from '../model/trust.page.model';
import { logger } from './logger';
import { Trust } from '../model/trust.model';
import { generateTrustId } from './trust/details.mapper';
import { ApplicationData } from 'model';
import { checkRelevantPeriod } from './relevant.period';
import { fetchApplicationData } from './application.data';
import { isAddTrustToBeValidated } from '../validation/add.trust.validation';
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";

import { getRedirectUrl, isRemoveJourney } from './url';
import { ValidationError, validationResult } from 'express-validator';
import { getTrustArray, hasNoBoAssignableToTrust } from './trusts';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';

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
};

const getPageProperties = async (
  req: Request,
  isUpdate: boolean,
  formData?: PageModel.AddTrust,
  errors?: FormattedValidationErrors,
): Promise<TrustInvolvedPageProperties> => {

  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, !isRemove);

  // note: isUpdate covers both Update and Remove journeys, so when on Remove journey isUpdate will be true.
  return {
    ...appData,
    errors,
    isUpdate,
    formData,
    url: getUrl(isUpdate),
    templateName: getPageTemplate(isUpdate),
    backLinkUrl: getBackLinkUrl(isUpdate, req, appData),
    pageParams: {
      title: ADD_TRUST_TEXTS.title,
      subtitle: ADD_TRUST_TEXTS.subtitle,
    },
    pageData: {
      trustData: getTrustArray(appData),
      isRelevantPeriod: isUpdate ? checkRelevantPeriod(appData) : false,
      isAddTrustQuestionToBeShown: !isUpdate || !hasNoBoAssignableToTrust(appData)
    },
  };
};

export const getTrusts = async (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean
): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const pageProps = await getPageProperties(req, isUpdate);
    if (!isUpdate) {
      addActiveSubmissionBasePathToTemplateData(pageProps, req);
    }
    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postTrusts = async (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean
): Promise<void> => {

  try {

    logger.debugRequest(req, `POST ${getPageTemplate(isUpdate)}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const addNewTrust = req.body["addTrust"];
    const formData: PageModel.AddTrust = req.body as PageModel.AddTrust;
    const errorList = validationResult(req);
    const errors = getValidationErrors(appData, req);

    if (!errorList.isEmpty() || errors.length) {
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];
      const pageProps = await getPageProperties(
        req,
        isUpdate,
        formData,
        formatValidationError([...errorListArray, ...errors]),
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
  if (isUpdate) {
    return config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE;
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.TRUST_ENTRY_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.TRUST_ENTRY_URL,
    });
  }
};

const nextPage = (isUpdate: boolean, req: Request) => {
  if (isUpdate) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
    });
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.CHECK_YOUR_ANSWERS_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.CHECK_YOUR_ANSWERS_URL,
    });
  }
};

const getPageTemplate = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_PAGE;
  } else {
    return config.ADD_TRUST_PAGE;
  }
};

const getBackLinkUrl = (isUpdate: boolean, req: Request, appData: ApplicationData) => {
  const trustId = getTrustArray(appData).length;
  if (isUpdate && trustId > 0) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
    }) + `/${trustId}${config.TRUST_INVOLVED_URL}`;
  } else if (isUpdate) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    });
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.BENEFICIAL_OWNER_TYPE_URL,
    });
  }
};

const getUrl = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_AN_OVERSEAS_ENTITY_URL;
  } else {
    return config.REGISTER_AN_OVERSEAS_ENTITY_URL;
  }
};

const getValidationErrors = (appData: ApplicationData, req: Request): ValidationError[] => {
  const filingPeriodTrustStartDateErrors = isAddTrustToBeValidated(appData, req);
  return [...filingPeriodTrustStartDateErrors];
};
