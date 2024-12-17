import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';
import { ValidationError, validationResult } from 'express-validator';

import * as config from '../config';
import { logger } from '../utils/logger';
import { TrusteeType } from '../model/trustee.type.model';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import { ApplicationData } from '../model';
import * as PageModel from '../model/trust.page.model';
import { saveAndContinue } from '../utils/save.and.continue';
import { safeRedirect } from '../utils/http.ext';
import { isActiveFeature } from './feature.flag';

import { getUrlWithParamsToPath, isRegistrationJourney } from './url';
import { checkTrustLegalEntityBeneficialOwnerStillInvolved } from '../validation/stillInvolved.validation';
import { fetchApplicationData, setExtraData } from '../utils/application.data';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { getTrustByIdFromApp, saveHistoricalBoInTrust, saveTrustInApp } from '../utils/trusts';
import { mapBeneficialOwnerToSession, mapFormerTrusteeByIdFromSessionToPage } from '../utils/trust/historical.beneficial.owner.mapper';
import { filingPeriodTrustCeaseDateValidations, filingPeriodTrustStartDateValidations } from '../validation/async';
import { updateOverseasEntity } from "../service/overseas.entities.service";

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

  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
  const { templateName, template } = getPageTemplate(isUpdate, req.url);

  return ({
    backLinkUrl: getTrustInvolvedUrl(isUpdate, trustId, req),
    templateName,
    template,
    pageParams: {
      title: HISTORICAL_BO_TEXTS.title,
    },
    pageData: {
      trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(appData, trustId, false),
      trusteeType: TrusteeType,
    },
    formData,
    errors,
    url: getUrl(isUpdate),
  });
};

export const getTrustFormerBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
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
    const isRegistration = isRegistrationJourney(req);
    let appData: ApplicationData = await fetchApplicationData(req, isRegistration);

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

const getTrustInvolvedUrl = (isUpdate: boolean, trustId: string, req: Request) => (
  isUpdate
    ? `${config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}/${trustId}${config.TRUST_INVOLVED_URL}`
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
  let url = `${config.TRUST_ENTRY_URL}`;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    url = getUrlWithParamsToPath(config.TRUST_ENTRY_WITH_PARAMS_URL, req);
  }
  return url;
};

// Get validation errors that depend on an asynchronous request
const getValidationErrors = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const stillInvolvedErrors = checkTrustLegalEntityBeneficialOwnerStillInvolved(appData, req);
  const filingPeriodTrustStartDateErrors = await filingPeriodTrustStartDateValidations(req);
  const filingPeriodTrustCeaseDateErrors = await filingPeriodTrustCeaseDateValidations(req);

  return [...stillInvolvedErrors, ...filingPeriodTrustStartDateErrors, ...filingPeriodTrustCeaseDateErrors];
};
