import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from './logger';
import * as CommonTrustDataMapper from './trust/common.trust.data.mapper';
import { RoleWithinTrustType } from '../model/role.within.trust.type.model';
import { getApplicationData, setExtraData } from './application.data';
import { getTrustByIdFromApp, saveTrustInApp, saveIndividualTrusteeInTrust } from './trusts';
import * as PageModel from '../model/trust.page.model';
import { ApplicationData } from '../model';
import { mapIndividualTrusteeToSession, mapIndividualTrusteeByIdFromSessionToPage } from './trust/individual.trustee.mapper';
import { safeRedirect } from './http.ext';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { validationResult } from 'express-validator';
import { Session } from '@companieshouse/node-session-handler';
import { saveAndContinue } from './save.and.continue';
import { isActiveFeature } from './feature.flag';
import { getUrlWithParamsToPath } from './url';

export const INDIVIDUAL_BO_TEXTS = {
  title: 'Tell us about the individual',
};

type TrustIndividualBeneificalOwnerPageProperties = {
  backLinkUrl: string,
  templateName: string;
  pageData: {
    trustData: PageModel.CommonTrustData,
    roleWithinTrustType: typeof RoleWithinTrustType;
  },
  pageParams: {
    title: string;
  },
  formData?: PageModel.IndividualTrusteesFormCommon,
  errors?: FormattedValidationErrors,
  url: string,
  isUpdate: boolean
};

const getPageProperties = (
  req: Request,
  trustId: string,
  isUpdate: boolean,
  formData?: PageModel.IndividualTrusteesFormCommon,
  errors?: FormattedValidationErrors,
): TrustIndividualBeneificalOwnerPageProperties => {

  return {
    backLinkUrl: getTrustInvolvedUrl(isUpdate, trustId, req),
    templateName: getPageTemplate(isUpdate),
    pageParams: {
      title: INDIVIDUAL_BO_TEXTS.title,
    },
    pageData: {
      trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(getApplicationData(req.session), trustId, false),
      roleWithinTrustType: RoleWithinTrustType
    },
    formData,
    errors,
    url: getUrl(isUpdate),
    isUpdate
  };
};

export const getTrustIndividualBo = (req: Request, res: Response, next: NextFunction, isUpdate: boolean): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
    const appData: ApplicationData = getApplicationData(req.session);

    const formData: PageModel.IndividualTrusteesFormCommon = mapIndividualTrusteeByIdFromSessionToPage(
      appData,
      trustId,
      trusteeId
    );
    const pageProps = getPageProperties(req, trustId, isUpdate, formData);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

export const postTrustIndividualBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

    // convert from data to application (session) object
    const individualTrusteeData = mapIndividualTrusteeToSession(req.body);

    // get trust data from session
    let appData: ApplicationData = getApplicationData(req.session);

    // check for errors
    const errorList = validationResult(req);
    const formData: PageModel.IndividualTrusteesFormCommon = req.body as PageModel.IndividualTrusteesFormCommon;
    // if no errors present rerender the page
    if (!errorList.isEmpty()) {
      const pageProps = getPageProperties(
        req,
        trustId,
        isUpdate,
        formData,
        formatValidationError(errorList.array()),
      );
      return res.render(pageProps.templateName, pageProps);
    }

    const trustUpdate = saveIndividualTrusteeInTrust(
      getTrustByIdFromApp(appData, trustId),
      individualTrusteeData
    );

    //  update trust in application data
    appData = saveTrustInApp(appData, trustUpdate);

    // save to session
    const session = req.session as Session;
    setExtraData(session, appData);

    await saveAndContinue(req, session);

    return safeRedirect(res, getTrustInvolvedUrl(isUpdate, trustId, req));
  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

const getPageTemplate = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE;
  } else {
    return config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE;
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

const getUrl = (isUpdate: boolean) => {
  if (isUpdate) {
    return config.UPDATE_AN_OVERSEAS_ENTITY_URL;
  } else {
    return config.REGISTER_AN_OVERSEAS_ENTITY_URL;
  }
};
