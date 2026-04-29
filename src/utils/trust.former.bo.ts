import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';
import { ValidationError, validationResult } from 'express-validator';

import * as config from '../config';
import * as PageModel from '../model/trust.page.model';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import { logger } from '../utils/logger';
import { TrusteeType } from '../model/trustee.type.model';
import { safeRedirect } from '../utils/http.ext';
import { saveAndContinue } from '../utils/save.and.continue';
import { ApplicationData } from '../model';

import { isActiveFeature } from './feature.flag';
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { mapTrustApiToWebWhenFlagsAreSet } from "../utils/trust/api.to.web.mapper";

import { getRedirectUrl, isRemoveJourney } from './url';
import { fetchApplicationData, setExtraData } from '../utils/application.data';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { mapBeneficialOwnerToSession, mapFormerTrusteeByIdFromSessionToPage } from '../utils/trust/historical.beneficial.owner.mapper';
import { filingPeriodTrustCeaseDateValidations, filingPeriodTrustStartDateValidations } from '../validation/async';

import {
  saveTrustInApp,
  getTrustByIdFromApp,
  saveHistoricalBoInTrust,
} from '../utils/trusts';

export const HISTORICAL_BO_TEXTS = {
  title: 'Tell us about the former beneficial owner',
};

type TrustHistoricalBeneficialOwnerProperties = {
  backLinkUrl: string,
  templateName: string;
  template: string;
  pageParams: {
    title: string;
  },
  pageData: {
    trustData: PageModel.CommonTrustData,
    trusteeType: typeof TrusteeType;
  },
  formData?: PageModel.TrustHistoricalBeneficialOwnerForm,
  errors?: FormattedValidationErrors,
  url: string,
};

const getPageProperties = async (
  req: Request,
  trustId: string,
  isUpdate: boolean,
  formData?: PageModel.TrustHistoricalBeneficialOwnerForm,
  errors?: FormattedValidationErrors,
): Promise<TrustHistoricalBeneficialOwnerProperties> => {

  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
  const { templateName, template } = getPageTemplate(isUpdate, req.url);

  return ({
    errors,
    formData,
    template,
    templateName,
    url: getUrl(isUpdate),
    backLinkUrl: getTrustInvolvedUrl(isUpdate, trustId, req),
    pageParams: {
      title: HISTORICAL_BO_TEXTS.title,
    },
    pageData: {
      trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(appData, trustId, false),
      trusteeType: TrusteeType,
    },
  });
};

export const getTrustFormerBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    mapTrustApiToWebWhenFlagsAreSet(appData, !isRemove);
    const formData: PageModel.TrustHistoricalBeneficialOwnerForm = mapFormerTrusteeByIdFromSessionToPage(
      appData,
      trustId,
      trusteeId
    );
    const pageProps = await getPageProperties(req, trustId, isUpdate, formData);

    return res.render(pageProps.template, pageProps);

  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

export const postTrustFormerBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const isRemove: boolean = await isRemoveJourney(req);
    let appData: ApplicationData = await fetchApplicationData(req, !isRemove);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const boData = mapBeneficialOwnerToSession(req.body); // convert form data to application (session) object
    const errorList = validationResult(req);
    const errors = await getValidationErrors(appData, req);
    const formData: PageModel.TrustHistoricalBeneficialOwnerForm = req.body as PageModel.TrustHistoricalBeneficialOwnerForm;

    if (!errorList.isEmpty() || errors.length) {
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];
      const pageProps = await getPageProperties (
        req,
        trustId,
        isUpdate,
        formData,
        formatValidationError([...errorListArray, ...errors]),
      );
      return res.render(pageProps.template, pageProps);
    }

    const updatedTrust = saveHistoricalBoInTrust(getTrustByIdFromApp(appData, trustId), boData,);
    appData = saveTrustInApp(appData, updatedTrust);
    setExtraData(session, appData);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
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

const getTrustInvolvedUrl = (isUpdate: boolean, trustId: string, req: Request) => (
  isUpdate
    ? getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
    }) + `/${trustId}${config.TRUST_INVOLVED_URL}`
    : `${getTrustEntryUrl(req)}/${trustId}${config.TRUST_INVOLVED_URL}`
);

const getPageTemplate = (isUpdate: boolean, url: string) => (
  isUpdate
    ? { template: config.UPDATE_TRUSTS_TELL_US_ABOUT_FORMER_BO_PAGE, templateName: url.replace(config.UPDATE_AN_OVERSEAS_ENTITY_URL, "") }
    : { template: config.TRUST_HISTORICAL_BENEFICIAL_OWNER_PAGE, templateName: config.TRUST_HISTORICAL_BENEFICIAL_OWNER_PAGE }
);

const getUrl = (isUpdate: boolean) => (
  isUpdate
    ? config.UPDATE_AN_OVERSEAS_ENTITY_URL
    : config.REGISTER_AN_OVERSEAS_ENTITY_URL
);

const getTrustEntryUrl = (req: Request) => {
  return getRedirectUrl({
    req,
    urlWithEntityIds: config.TRUST_ENTRY_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.TRUST_ENTRY_URL,
  });
};

const getValidationErrors = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const filingPeriodTrustStartDateErrors = await filingPeriodTrustStartDateValidations(req);
  const filingPeriodTrustCeaseDateErrors = await filingPeriodTrustCeaseDateValidations(req);

  return [
    ...filingPeriodTrustStartDateErrors,
    ...filingPeriodTrustCeaseDateErrors
  ];
};
