import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';
import * as config from '../config';
import * as CommonTrustDataMapper from './trust/common.trust.data.mapper';
import * as PageModel from '../model/trust.page.model';
import { logger } from './logger';
import { safeRedirect } from './http.ext';
import { saveAndContinue } from './save.and.continue';
import { isActiveFeature } from './feature.flag';
import { ApplicationData } from '../model';
import { RoleWithinTrustType } from '../model/role.within.trust.type.model';
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { checkTrusteeInterestedDate } from '../validation/fields/date.validation';
import { checkTrustIndividualCeasedDate } from '../validation/async';
import { mapTrustApiToWebWhenFlagsAreSet } from "../utils/trust/api.to.web.mapper";
import { checkTrustIndividualBeneficialOwnerStillInvolved } from '../validation/stillInvolved.validation';

import { getRedirectUrl, isRemoveJourney } from './url';
import { ValidationError, validationResult } from 'express-validator';
import { fetchApplicationData, setExtraData } from './application.data';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { mapIndividualTrusteeToSession, mapIndividualTrusteeByIdFromSessionToPage } from './trust/individual.trustee.mapper';

import {
  saveTrustInApp,
  getTrustByIdFromApp,
  saveIndividualTrusteeInTrust,
} from './trusts';

export const INDIVIDUAL_BO_TEXTS = {
  title: 'Tell us about the individual',
};

type TrustIndividualBeneificalOwnerPageProperties = {
  backLinkUrl: string,
  templateName: string;
  template: string;
  pageData: {
    trustData: PageModel.CommonTrustData,
    roleWithinTrustType: typeof RoleWithinTrustType,
    relevant_period?: boolean,
    entity_name?: string;
  },
  pageParams: {
    title: string;
  },
  formData: PageModel.IndividualTrusteesFormCommon,
  errors?: FormattedValidationErrors,
  url: string,
  isUpdate: boolean
};

const getPageProperties = async (
  req: Request,
  trustId: string,
  isUpdate: boolean,
  formData: PageModel.IndividualTrusteesFormCommon,
  errors?: FormattedValidationErrors,
): Promise<TrustIndividualBeneificalOwnerPageProperties> => {

  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
  const { templateName, template } = getPageTemplate(isUpdate, req.url);

  return {
    errors,
    isUpdate,
    formData,
    template,
    templateName,
    url: getUrl(isUpdate),
    backLinkUrl: getTrustInvolvedUrl(isUpdate, trustId, req),
    pageParams: {
      title: INDIVIDUAL_BO_TEXTS.title,
    },
    pageData: {
      trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(appData, trustId, false),
      roleWithinTrustType: RoleWithinTrustType
    },
  };
};

const getPagePropertiesRelevantPeriod = async (
  isRelevantPeriod,
  req,
  trustId,
  isUpdate,
  formData,
  entityName,
  errors?: FormattedValidationErrors
): Promise<TrustIndividualBeneificalOwnerPageProperties> => {
  const pageProps = await getPageProperties(req, trustId, isUpdate, formData, errors);
  pageProps.formData.relevant_period = isRelevantPeriod;
  pageProps.pageData.entity_name = entityName;
  return pageProps;
};

export const getTrustIndividualBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    mapTrustApiToWebWhenFlagsAreSet(appData, !isRemove);
    const isRelevantPeriod = req.query['relevant-period'];
    const formData: PageModel.IndividualTrusteesFormCommon = mapIndividualTrusteeByIdFromSessionToPage(
      appData,
      trustId,
      trusteeId
    );
    const pageProps = await getPageProperties(req, trustId, isUpdate, formData);
    if (!isRelevantPeriod) {
      if (appData) {
        pageProps.pageData.entity_name = appData.entity_name;
      }
      return res.render(pageProps.template, pageProps);
    } else {
      const pagePropertiesRelevantPeriod = await getPagePropertiesRelevantPeriod(
        isRelevantPeriod,
        req,
        trustId,
        isUpdate,
        formData,
        appData.entity_name
      );
      return res.render(pageProps.template, pagePropertiesRelevantPeriod);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

export const postTrustIndividualBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const isRemove: boolean = await isRemoveJourney(req);
    let appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const individualTrusteeData = mapIndividualTrusteeToSession(req.body);
    const errorList = validationResult(req);
    const errors = await getValidationErrors(appData, req);
    const formData: PageModel.IndividualTrusteesFormCommon = req.body as PageModel.IndividualTrusteesFormCommon;

    if (!errorList.isEmpty() || errors.length > 0) {
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];
      const pageProps = await getPageProperties(
        req,
        trustId,
        isUpdate,
        formData,
        formatValidationError([...errorListArray, ...errors]),
      );
      const isRelevantPeriod = req.query ? req.query["relevant-period"] === "true" : false;
      if (!isRelevantPeriod && !individualTrusteeData?.relevant_period) {
        return res.render(pageProps.template, pageProps);
      } else {
        const pagePropertiesRelevantPeriod = await getPagePropertiesRelevantPeriod(
          true,
          req,
          trustId,
          isUpdate,
          formData,
          appData.entity_name,
          formatValidationError([...errorListArray, ...errors])
        );
        return res.render(pageProps.template, pagePropertiesRelevantPeriod);
      }
    }

    const trustUpdate = saveIndividualTrusteeInTrust(getTrustByIdFromApp(appData, trustId), individualTrusteeData);
    appData = saveTrustInApp(appData, trustUpdate);
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

const getPageTemplate = (isUpdate: boolean, url: string) => {
  if (isUpdate) {
    return {
      template: config.UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
      templateName: url.replace(config.UPDATE_AN_OVERSEAS_ENTITY_URL, "")
    };
  } else {
    return {
      template: config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
      templateName: config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE
    };
  }
};

const getTrustInvolvedUrl = (isUpdate: boolean, trustId: string, req: Request) => {
  if (isUpdate) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
    }) + `/${trustId}${config.TRUST_INVOLVED_URL}`;
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.TRUST_ENTRY_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.TRUST_ENTRY_URL,
    }) + `/${trustId}${config.TRUST_INVOLVED_URL}`;
  }
};

const getUrl = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_AN_OVERSEAS_ENTITY_URL;
  } else {
    return config.REGISTER_AN_OVERSEAS_ENTITY_URL;
  }
};

const getValidationErrors = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const stillInvolvedErrors = checkTrustIndividualBeneficialOwnerStillInvolved(appData, req);
  const ceasedDateErrors = await checkTrustIndividualCeasedDate(appData, req);
  const interestedDateErrors = checkTrusteeInterestedDate(appData, req);
  return [...stillInvolvedErrors, ...ceasedDateErrors, ...interestedDateErrors];
};
