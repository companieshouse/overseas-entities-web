import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';

import { logger } from './logger';
import * as config from '../config';
import { safeRedirect } from './http.ext';
import * as CommonTrustDataMapper from './trust/common.trust.data.mapper';
import { RoleWithinTrustType } from '../model/role.within.trust.type.model';
import { ApplicationData } from '../model';
import { saveAndContinue } from './save.and.continue';
import { isActiveFeature } from './feature.flag';
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { checkTrusteeLegalEntityCeasedDate } from '../validation/async';
import { checkTrustLegalEntityBeneficialOwnerStillInvolved } from '../validation/stillInvolved.validation';
import { checkInterestedPersonStartDate } from '../validation/fields/date.validation';

import { fetchApplicationData, setExtraData } from './application.data';
import { mapLegalEntityTrusteeByIdFromSessionToPage, mapLegalEntityToSession } from './trust/legal.entity.beneficial.owner.mapper';
import { CommonTrustData, TrustLegalEntityForm } from '../model/trust.page.model';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { ValidationError, validationResult } from 'express-validator';
import { getUrlWithParamsToPath, isRegistrationJourney } from './url';
import { mapTrustApiToWebWhenFlagsAreSet } from "../utils/trust/api.to.web.mapper";

import {
  getTrustByIdFromApp,
  saveLegalEntityBoInTrust,
  saveTrustInApp
} from './trusts';

export const LEGAL_ENTITY_BO_TEXTS = {
  title: 'Tell us about the legal entity',
};

type TrustLegalEntityBeneficialOwnerPageProperties = {
  backLinkUrl: string,
  templateName: string;
  template: string;
  pageParams: {
    title: string;
  },
  pageData: {
    trustData: CommonTrustData,
    roleWithinTrustType: typeof RoleWithinTrustType,
    entity_name?: string;
  },
  formData?: TrustLegalEntityForm,
  errors?: FormattedValidationErrors,
  url: string,
  isUpdate: boolean
};

const getPageProperties = async (
  req: Request,
  trustId: string,
  isUpdate: boolean,
  formData?: TrustLegalEntityForm,
  errors?: FormattedValidationErrors,
): Promise<TrustLegalEntityBeneficialOwnerPageProperties> => {

  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
  const { templateName, template } = getPageTemplate(isUpdate, req.url);

  return {
    backLinkUrl: getTrustInvolvedUrl(isUpdate, trustId, req),
    templateName,
    template,
    pageParams: {
      title: LEGAL_ENTITY_BO_TEXTS.title,
    },
    pageData: {
      trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(appData, trustId, false),
      roleWithinTrustType: RoleWithinTrustType
    },
    formData,
    errors,
    url: getUrl(isUpdate),
    isUpdate
  };
};

export const getRelevantPeriodPageProperties = (
  req: Request,
  trustId: string,
  isUpdate: boolean,
  formData?: TrustLegalEntityForm,
  errors?: FormattedValidationErrors,
): Promise<TrustLegalEntityBeneficialOwnerPageProperties> => {
  return getPageProperties(req, trustId, isUpdate, formData, errors);
};

export const getTrustLegalEntityBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    mapTrustApiToWebWhenFlagsAreSet(appData, isRegistration);
    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
    const isRelevantPeriod = req.query ? req.query["relevant-period"] === "true" : false;

    const formData: TrustLegalEntityForm = mapLegalEntityTrusteeByIdFromSessionToPage(
      appData,
      trustId,
      trusteeId
    );
    // conditionally toggle display of relevant period page text and role within trust type will default to Beneficiary
    const pageProps = isRelevantPeriod ? await getRelevantPeriodPageProperties(req, trustId, isUpdate, formData) : await getPageProperties(req, trustId, isUpdate, formData);
    if ((isRelevantPeriod || (trusteeId && pageProps.formData?.relevant_period)) && pageProps.formData) {
      pageProps.formData.relevant_period = true;
      setEntityNameInRelevantPeriodPageBanner(pageProps, appData ? appData.entity_name : pageProps.pageData.trustData.trustName);
    }

    return res.render(pageProps.template, pageProps);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postTrustLegalEntityBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    let appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    const session = req.session as Session;
    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const legalEntityBoData = mapLegalEntityToSession(req.body);
    const errorList = validationResult(req);
    const errors = await getValidationErrors(appData, req);
    const formData: TrustLegalEntityForm = req.body as TrustLegalEntityForm;

    if (!errorList.isEmpty() || errors.length) {
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];
      const formattedErrors = formatValidationError([...errorListArray, ...errors]);
      let pageProps;
      if (req.query["relevant-period"] === "true") {
        pageProps = await getRelevantPeriodPageProperties(req, trustId, isUpdate, formData, formattedErrors);
      } else {
        pageProps = await getPageProperties(req, trustId, isUpdate, formData, formattedErrors);
      }
      setEntityNameInRelevantPeriodPageBanner(pageProps, appData ? appData.entity_name : pageProps.pageData.trustData.trustName);
      return res.render(pageProps.template, pageProps);
    }

    const updatedTrust = saveLegalEntityBoInTrust(getTrustByIdFromApp(appData, trustId), legalEntityBoData,);
    appData = saveTrustInApp(appData, updatedTrust);
    setExtraData(session, appData);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      await updateOverseasEntity(req, session, appData);
    } else {
      await saveAndContinue(req, session);
    }

    return safeRedirect(res, getTrustInvolvedUrl(isUpdate, trustId, req));

  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

const getTrustInvolvedUrl = (isUpdate: boolean, trustId: string, req: Request) => {
  if (isUpdate) {
    return `${config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}/${trustId}${config.TRUST_INVOLVED_URL}`;
  } else {
    let entryUrl = `${config.TRUST_ENTRY_URL}`;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      entryUrl = getUrlWithParamsToPath(config.TRUST_ENTRY_WITH_PARAMS_URL, req);
    }
    return entryUrl + `/${trustId}${config.TRUST_INVOLVED_URL}`;
  }
};

const getPageTemplate = (isUpdate: boolean, url: string) => (
  isUpdate
    ? { template: config.UPDATE_TRUSTS_TELL_US_ABOUT_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE, templateName: url.replace(config.UPDATE_AN_OVERSEAS_ENTITY_URL, "") }
    : { template: config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE, templateName: config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE }
);

const getUrl = (isUpdate: boolean) => (
  isUpdate ? config.UPDATE_AN_OVERSEAS_ENTITY_URL : config.REGISTER_AN_OVERSEAS_ENTITY_URL
);

export const setEntityNameInRelevantPeriodPageBanner = (pageProps: TrustLegalEntityBeneficialOwnerPageProperties, entityName: string | undefined) => {
  // name the entity for the page template
  if (pageProps && pageProps.pageData && entityName !== undefined) {
    pageProps.pageData.entity_name = entityName;
  }
  return pageProps;
};

// Get validation errors that depend on an asynchronous request
const getValidationErrors = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const stillInvolvedErrors = checkTrustLegalEntityBeneficialOwnerStillInvolved(appData, req);
  const ceasedDateErrors = await checkTrusteeLegalEntityCeasedDate(appData, req);
  const interestedDateErrors = checkInterestedPersonStartDate(appData, req);

  return [...stillInvolvedErrors, ...ceasedDateErrors, ...interestedDateErrors];
};
