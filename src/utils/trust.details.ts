import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';

import { logger } from '../utils/logger';
import * as config from '../config';
import * as mapperDetails from '../utils/trust/details.mapper';
import * as mapperBo from '../utils/trust/beneficial.owner.mapper';
import { ApplicationData } from '../model/application.model';
import * as PageModel from '../model/trust.page.model';
import { BeneficialOwnerIndividualKey } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../model/beneficial.owner.other.model';
import { safeRedirect } from '../utils/http.ext';
import { validationResult } from 'express-validator/src/validation-result';
import { saveAndContinue } from '../utils/save.and.continue';
import { isActiveFeature } from "../utils/feature.flag";
import { ValidationError } from 'express-validator';
import { checkTrustStillInvolved } from '../validation/stillInvolved.validation';
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { Trust } from "../model/trust.model";

import { getUrlWithParamsToPath, isRegistrationJourney } from "../utils/url";
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { fetchApplicationData, setExtraData } from '../utils/application.data';

import {
  setTrustDetailsAsReviewed,
  getReviewTrustById,
  updateTrustInReviewList,
} from './update/review_trusts';

import {
  getBoIndividualAssignableToTrust,
  getBoOtherAssignableToTrust,
  getTrustArray,
  containsTrustData,
  saveTrustInApp,
  getTrustByIdFromApp,
  hasNoBoAssignableToTrust,
} from '../utils/trusts';

export const TRUST_DETAILS_TEXTS = {
  title: 'Tell us about the trust',
  review_title: 'Review the trust',
  subtitle: 'You can add more trusts later.',
  review_subtitle: 'If you need to update this information, you can change the answers here.'
};

type TrustDetailPageProperties = {
  backLinkUrl: string;
  templateName: string;
  template: string;
  isUpdate: boolean;
  isReview?: boolean,
  pageParams: {
    title: string;
    subtitle: string,
  };
  pageData: {
    beneficialOwners: PageModel.TrustBeneficialOwnerListItem[];
  };
  formData: PageModel.TrustDetailsForm,
  errors?: FormattedValidationErrors,
  url: string,
};

const getPageProperties = async (
  req: Request,
  formData: PageModel.TrustDetailsForm,
  isUpdate: boolean,
  isReview: boolean,
  errors?: FormattedValidationErrors,
): Promise<TrustDetailPageProperties> => {

  const { templateName, template } = getPageTemplate(isUpdate, isReview, req.url);
  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
  const boAvailableForTrust = [
    ...getBoIndividualAssignableToTrust(appData)
      .map(mapperBo.mapBoIndividualToPage),
    ...getBoOtherAssignableToTrust(appData)
      .map(mapperBo.mapBoOtherToPage),
  ];

  return {
    backLinkUrl: getBackLinkUrl(isUpdate, appData, req, isReview),
    templateName,
    template,
    pageParams: {
      title: isReview ? TRUST_DETAILS_TEXTS.review_title : TRUST_DETAILS_TEXTS.title,
      subtitle: isReview ? TRUST_DETAILS_TEXTS.review_subtitle : TRUST_DETAILS_TEXTS.subtitle,
    },
    pageData: {
      beneficialOwners: boAvailableForTrust,
    },
    ...appData,
    formData,
    isUpdate,
    isReview,
    errors,
    url: getUrl(isUpdate),
  };
};

const getPagePropertiesRelevantPeriod = async (req, formData, isUpdate, isReview, errors?: FormattedValidationErrors): Promise<TrustDetailPageProperties> => {
  const pageProps = await getPageProperties(req, formData, isUpdate, isReview, errors);
  pageProps.formData.relevant_period = true;
  return pageProps;
};

export const getTrustDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
  isUpdate: boolean,
  isReview: boolean
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

    let trustId;
    if (!isReview) {
      trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    } else {
      const trustInReview = appData.update?.review_trusts?.find(trust => trust.review_status);
      trustId = trustInReview?.trust_id;
    }

    const formData: PageModel.TrustDetailsForm = mapperDetails.mapDetailToPage(appData, trustId, isReview,);

    let pageProps;
    if (req.query["relevant-period"] === "true") {
      pageProps = await getPagePropertiesRelevantPeriod(req, formData, isUpdate, isReview);
    } else {
      pageProps = await getPageProperties(req, formData, isUpdate, isReview);
    }

    return res.render(pageProps.template, pageProps);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postTrustDetails = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean, isReview: boolean) => {
  /**
   * Set/remove trust id to/from beneficial owner in Application data
   *
   * @param appData Application Data in Session
   * @param trustId Set/remove identifier
   * @param selectedBoIds set for selected beneficial owners
   */
  const updateBeneficialOwnersTrustInApp = (
    appData: ApplicationData,
    trustId: string,
    selectedBoIds: string[],
  ): ApplicationData => {
    const boIndividual = mapperDetails.mapBeneficialOwnerToSession(
      appData[BeneficialOwnerIndividualKey],
      selectedBoIds,
      trustId,
    );

    const boOther = mapperDetails.mapBeneficialOwnerToSession(
      appData[BeneficialOwnerOtherKey],
      selectedBoIds,
      trustId,
    );

    return {
      ...appData,
      [BeneficialOwnerOtherKey]: boOther,
      [BeneficialOwnerIndividualKey]: boIndividual,
    };
  };

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const isRegistration = isRegistrationJourney(req);
    let appData: ApplicationData = await fetchApplicationData(req, isRegistration);

    // check for errors
    const errorList = validationResult(req);
    const errors = getValidationErrors(appData, req);
    const formData: PageModel.TrustDetailsForm = req.body as PageModel.TrustDetailsForm;

    if (!errorList.isEmpty() || errors.length) {
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];
      const formattedErrors = formatValidationError([...errorListArray, ...errors]);
      let pageProps;
      if (req.query["relevant-period"] === "true") {
        pageProps = await getPagePropertiesRelevantPeriod(req, formData, isUpdate, isReview, formattedErrors);
      } else {
        pageProps = await getPageProperties(req, formData, isUpdate, isReview, formattedErrors);
      }
      return res.render(pageProps.template, pageProps);
    }

    // map form data to session trust data
    const details = mapperDetails.mapDetailToSession(req.body, hasNoBoAssignableToTrust(appData));
    if (!details.trust_id) {
      details.trust_id = mapperDetails.generateTrustId(appData);
    }

    appData = getAndUpdateTrustData(req, isReview, appData, details);

    // update trusts in beneficial owners
    const selectedBoIds = req.body?.beneficialOwnersIds ?? [];
    appData = updateBeneficialOwnersTrustInApp(appData, details.trust_id, selectedBoIds);

    // if reviewing a trust, mark trust as in review
    if (isReview) {
      setTrustDetailsAsReviewed(appData);
    }

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      await updateOverseasEntity(req, session, appData);
    } else {
      await saveAndContinue(req, session);
    }
    setExtraData(session, appData);

    return safeRedirect(res, getNextPage(isUpdate, details.trust_id, req, isReview));

  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

const getAndUpdateTrustData = (req: Request, isReview: boolean, appData: ApplicationData, trustDetails: Trust) => {
  // if present, get existing trust from appData (as it might have attached trustees)
  let trust;
  if (isReview) {
    trust = getReviewTrustById(appData, trustDetails.trust_id);
  } else {
    trust = getTrustByIdFromApp(appData, trustDetails.trust_id);
  }
  Object.keys(trustDetails).forEach(key => trust[key] = trustDetails[key]);
  if (isReview) {
    updateTrustInReviewList(appData, trust);
  } else {
    appData = saveTrustInApp(appData, trust);
  }
  return appData;
};

const getBackLinkUrl = (isUpdate: boolean, appData: ApplicationData, req: Request, isReview?: boolean) => {
  let backLinkUrl: string;
  if (isUpdate) {
    backLinkUrl = config.UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL;
    if (containsTrustData(getTrustArray(appData))) {
      backLinkUrl = `${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL}`;
    }
  } else {
    backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
      ? getUrlWithParamsToPath(config.TRUST_ENTRY_WITH_PARAMS_URL, req)
      : config.TRUST_ENTRY_URL;
    backLinkUrl += config.TRUST_INTERRUPT_URL;
    if (containsTrustData(getTrustArray(appData))) {
      backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
        ? getUrlWithParamsToPath(config.TRUST_ENTRY_WITH_PARAMS_URL, req)
        : config.TRUST_ENTRY_URL;
      backLinkUrl += config.ADD_TRUST_URL;
    }
  }
  if (isReview) {
    backLinkUrl = config.UPDATE_MANAGE_TRUSTS_INTERRUPT_URL;
  }
  return backLinkUrl;
};

const getPageTemplate = (isUpdate: boolean, isReview: boolean, url: string) => {
  if (isReview) {
    return { template: config.UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE, templateName: config.UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE };
  }
  if (isUpdate) {
    return { template: config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE, templateName: url.replace(config.UPDATE_AN_OVERSEAS_ENTITY_URL, "") };
  } else {
    return { template: config.TRUST_DETAILS_PAGE, templateName: config.TRUST_DETAILS_PAGE };
  }
};

const getUrl = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_AN_OVERSEAS_ENTITY_URL;
  } else {
    return config.REGISTER_AN_OVERSEAS_ENTITY_URL;
  }
};

const getNextPage = (isUpdate: boolean, trustId: string, req: Request, isReview?: boolean) => {
  if (isReview) {
    return config.UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL;
  } else if (isUpdate) {
    let nextPageUrl = `${config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}/${trustId}${config.TRUST_INVOLVED_URL}`;
    if (req.query["relevant-period"] === "true") {
      nextPageUrl += config.RELEVANT_PERIOD_QUERY_PARAM;
    }
    return nextPageUrl;
  } else {
    let nextPageUrl = `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      nextPageUrl = getUrlWithParamsToPath(`${config.TRUST_ENTRY_WITH_PARAMS_URL}/${trustId}${config.TRUST_INVOLVED_URL}`, req);
    }
    return nextPageUrl;
  }
};

// Get validation errors that depend on an asynchronous request
const getValidationErrors = (appData: ApplicationData, req: Request): ValidationError[] => {
  const stillInvolvedErrors = checkTrustStillInvolved(appData, req);
  return [...stillInvolvedErrors];
};

