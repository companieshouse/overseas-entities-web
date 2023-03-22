import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { TrusteeType } from '../model/trustee.type.model';
import { getApplicationData, setExtraData } from '../utils/application.data';
import { getTrustByIdFromApp, saveHistoricalBoInTrust, saveTrustInApp } from '../utils/trusts';
import { mapBeneficialOwnerToSession, mapFormerTrusteeFromSessionToPage } from '../utils/trust/historical.beneficial.owner.mapper';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import { ApplicationData } from '../model';
import * as PageModel from '../model/trust.page.model';
import { CommonTrustData } from '../model/trust.page.model';
import { saveAndContinue } from '../utils/save.and.continue';
import { Session } from '@companieshouse/node-session-handler';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { validationResult } from 'express-validator';

const HISTORICAL_BO_TEXTS = {
  title: 'Tell us about the former beneficial owner',
};

type TrustHistoricalBeneficialOwnerProperties = {
  backLinkUrl: string,
  templateName: string;
  pageParams: {
    title: string;
  },
  pageData: {
    trustData: CommonTrustData,
    trusteeType: typeof TrusteeType;
  },
  formData?: PageModel.TrustHistoricalBeneficialOwnerForm,
  errors?: FormattedValidationErrors,
};

const getPageProperties = (
  req: Request,
  trustId: string,
  formData?: PageModel.TrustHistoricalBeneficialOwnerForm,
  errors?: FormattedValidationErrors,
): TrustHistoricalBeneficialOwnerProperties => {

  return {
    backLinkUrl: `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`,
    templateName: config.TRUST_HISTORICAL_BENEFICIAL_OWNER_PAGE,
    pageParams: {
      title: HISTORICAL_BO_TEXTS.title,
    },
    pageData: {
      trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(getApplicationData(req.session), trustId),
      trusteeType: TrusteeType,
    },
    formData,
    errors,
  };
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
    const appData: ApplicationData = getApplicationData(req.session);

    const formData: PageModel.TrustHistoricalBeneficialOwnerForm = mapFormerTrusteeFromSessionToPage(
      appData,
      trustId,
      trusteeId
    );
    const pageProps = getPageProperties(req, trustId, formData);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

const post = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

    //  convert form data to application (session) object
    const boData = mapBeneficialOwnerToSession(req.body);

    //  get trust data from session
    let appData: ApplicationData = getApplicationData(req.session);

    // check for errors
    const errorList = validationResult(req);
    const formData: PageModel.TrustHistoricalBeneficialOwnerForm = req.body as PageModel.TrustHistoricalBeneficialOwnerForm;
    // if no errors present rerender the page
    if (!errorList.isEmpty()) {
      const pageProps = getPageProperties(
        req,
        trustId,
        formData,
        formatValidationError(errorList.array()),
      );
      return res.render(pageProps.templateName, pageProps);
    }

    //  save (add/update) bo to trust
    const updatedTrust = saveHistoricalBoInTrust(
      getTrustByIdFromApp(appData, trustId),
      boData,
    );

    //  update trust in application data
    appData = saveTrustInApp(appData, updatedTrust);

    //  save to session
    const session = req.session as Session;
    setExtraData(session, appData);

    await saveAndContinue(req, session, true);

    return res.redirect(`${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

export {
  get,
  post,
  HISTORICAL_BO_TEXTS,
};
