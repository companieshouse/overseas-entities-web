import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { TrusteeType } from '../model/trustee.type.model';
import { getApplicationData, setExtraData } from '../utils/application.data';
import { getTrustByIdFromApp, saveHistoricalBoInTrust, saveTrustInApp } from '../utils/trusts';
import { mapBeneficialOwnerToSession, mapFormerTrusteeByIdFromSessionToPage } from '../utils/trust/historical.beneficial.owner.mapper';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import { ApplicationData } from '../model';
import * as PageModel from '../model/trust.page.model';
import { saveAndContinue } from '../utils/save.and.continue';
import { Session } from '@companieshouse/node-session-handler';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { validationResult } from 'express-validator';
import { safeRedirect } from '../utils/http.ext';
import { isActiveFeature } from './feature.flag';
import { getUrlWithParamsToPath } from './url';

export const HISTORICAL_BO_TEXTS = {
  title: 'Tell us about the former beneficial owner',
};

type TrustHistoricalBeneficialOwnerProperties = {
  backLinkUrl: string,
  templateName: string;
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

const getPageProperties = (
  req: Request,
  trustId: string,
  isUpdate: boolean,
  formData?: PageModel.TrustHistoricalBeneficialOwnerForm,
  errors?: FormattedValidationErrors,
): TrustHistoricalBeneficialOwnerProperties => ({
  backLinkUrl: getTrustInvolvedUrl(isUpdate, trustId),
  templateName: getPageTemplate(isUpdate),
  pageParams: {
    title: HISTORICAL_BO_TEXTS.title,
  },
  pageData: {
    trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(getApplicationData(req.session), trustId, false),
    trusteeType: TrusteeType,
  },
  formData,
  errors,
  url: getUrl(isUpdate),
});

export const getTrustFormerBo = (req: Request, res: Response, next: NextFunction, isUpdate: boolean): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
    const appData: ApplicationData = getApplicationData(req.session);

    const formData: PageModel.TrustHistoricalBeneficialOwnerForm = mapFormerTrusteeByIdFromSessionToPage(
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

export const postTrustFormerBo = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

    // convert form data to application (session) object
    const boData = mapBeneficialOwnerToSession(req.body);

    // get trust data from session
    let appData: ApplicationData = getApplicationData(req.session);

    // check for errors
    const errorList = validationResult(req);
    const formData: PageModel.TrustHistoricalBeneficialOwnerForm = req.body as PageModel.TrustHistoricalBeneficialOwnerForm;

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

    // save (add/update) bo to trust
    const updatedTrust = saveHistoricalBoInTrust(
      getTrustByIdFromApp(appData, trustId),
      boData,
    );

    // update trust in application data
    appData = saveTrustInApp(appData, updatedTrust);

    // save to session
    const session = req.session as Session;
    setExtraData(session, appData);

    await saveAndContinue(req, session, true);

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

const getPageTemplate = (isUpdate: boolean) => (
  isUpdate
    ? config.UPDATE_TRUSTS_TELL_US_ABOUT_FORMER_BO_PAGE
    : config.TRUST_HISTORICAL_BENEFICIAL_OWNER_PAGE
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
