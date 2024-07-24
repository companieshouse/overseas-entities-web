import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from './logger';
import { safeRedirect } from './http.ext';
import { getApplicationData, setExtraData } from './application.data';
import { getTrustByIdFromApp, saveLegalEntityBoInTrust, saveTrustInApp } from './trusts';
import * as CommonTrustDataMapper from './trust/common.trust.data.mapper';
import { mapLegalEntityTrusteeByIdFromSessionToPage, mapLegalEntityToSession } from './trust/legal.entity.beneficial.owner.mapper';
import { RoleWithinTrustType } from '../model/role.within.trust.type.model';
import { ApplicationData } from '../model';
import { CommonTrustData, TrustLegalEntityForm } from '../model/trust.page.model';
import { Session } from '@companieshouse/node-session-handler';
import { saveAndContinue } from './save.and.continue';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { validationResult } from 'express-validator';
import { isActiveFeature } from './feature.flag';
import { getUrlWithParamsToPath } from './url';

export const LEGAL_ENTITY_BO_TEXTS = {
  title: 'Tell us about the legal entity',
};

type TrustLegalEntityBeneificalOwnerPageProperties = {
  backLinkUrl: string,
  templateName: string;
  pageParams: {
    title: string;
  },
  pageData: {
    trustData: CommonTrustData,
    roleWithinTrustType: typeof RoleWithinTrustType;
    relevant_period: boolean;
    entity_name: string;
  },
  formData?: TrustLegalEntityForm,
  errors?: FormattedValidationErrors,
  url: string,
  isUpdate: boolean
};

const getPageProperties = (
  req: Request,
  trustId: string,
  isUpdate: boolean,
  formData?: TrustLegalEntityForm,
  errors?: FormattedValidationErrors,
): TrustLegalEntityBeneificalOwnerPageProperties => {

  const relevant_period = req.query['relevant-period'] === "true";
  const trustData = CommonTrustDataMapper.mapCommonTrustDataToPage(getApplicationData(req.session), trustId, false);
  return {
    backLinkUrl: getTrustInvolvedUrl(isUpdate, trustId, req),
    templateName: getPageTemplate(isUpdate),
    pageParams: {
      title: LEGAL_ENTITY_BO_TEXTS.title,
    },
    pageData: {
      trustData: trustData,
      roleWithinTrustType: RoleWithinTrustType,
      relevant_period: relevant_period,
      entity_name: trustData.trustName,
    },
    formData,
    errors,
    url: relevant_period ? getUrl(isUpdate) + config.RELEVANT_PERIOD_QUERY_PARAM : getUrl(isUpdate),
    isUpdate
  };
};

export const getTrustLegalEntityBo = (req: Request, res: Response, next: NextFunction, isUpdate: boolean): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
    const appData: ApplicationData = getApplicationData(req.session);

    const formData: TrustLegalEntityForm = mapLegalEntityTrusteeByIdFromSessionToPage(
      appData,
      trustId,
      trusteeId
    );
    const pageProps = getPageProperties(req, trustId, isUpdate, formData);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postTrustLegalEntityBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

    //  convert form data to application (session) object
    const legalEntityBoData = mapLegalEntityToSession(req.body);

    //  get trust data from session
    let appData: ApplicationData = getApplicationData(req.session);

    // validate request
    const errorList = validationResult(req);
    const formData: TrustLegalEntityForm = req.body as TrustLegalEntityForm;

    if (errorList && !errorList.isEmpty()) {
      const pageProps = getPageProperties(
        req,
        trustId,
        isUpdate,
        formData,
        formatValidationError(errorList.array()),
      );
      return res.render(pageProps.templateName, pageProps);
    }

    //  save (add/update) bo to trust
    const updatedTrust = saveLegalEntityBoInTrust(
      getTrustByIdFromApp(appData, trustId),
      legalEntityBoData,
    );

    //  update trust in application data
    appData = saveTrustInApp(appData, updatedTrust);

    //  save to session
    const session = req.session as Session;
    setExtraData(session, appData);

    await saveAndContinue(req, session, true);

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

const getPageTemplate = (isUpdate: boolean) => (
  isUpdate
    ? config.UPDATE_TRUSTS_TELL_US_ABOUT_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE
    : config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE
);

const getUrl = (isUpdate: boolean) => (
  isUpdate
    ? config.UPDATE_AN_OVERSEAS_ENTITY_URL
    : config.REGISTER_AN_OVERSEAS_ENTITY_URL
);
