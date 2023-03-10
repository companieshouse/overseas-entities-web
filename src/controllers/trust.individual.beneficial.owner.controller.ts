import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import { RoleWithinTrustType } from '../model/role.within.trust.type.model';
import { getApplicationData, setExtraData } from '../utils/application.data';
import { getTrustByIdFromApp, saveTrustInApp, saveIndividualTrusteeInTrust } from '../utils/trusts';
import * as PageModel from '../model/trust.page.model';
import { ApplicationData } from '../model';
import { mapIndividualTrusteeToSession, mapIndividualTrusteeFromSessionToPage } from '../utils/trust/individual.trustee.mapper';
import { safeRedirect } from '../utils/http.ext';
import { FormattedValidationErrors, formatValidationError } from '../middleware/validation.middleware';
import { validationResult } from 'express-validator';
import { Session } from '@companieshouse/node-session-handler';
import { saveAndContinue } from '../utils/save.and.continue';

const INDIVIDUAL_BO_TEXTS = {
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
};

const getPageProperties = (
  req: Request,
  trustId: string,
  formData?: PageModel.IndividualTrusteesFormCommon,
  errors?: FormattedValidationErrors,
): TrustIndividualBeneificalOwnerPageProperties => {

  return {
    backLinkUrl: `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`,
    templateName: config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
    pageParams: {
      title: INDIVIDUAL_BO_TEXTS.title,
    },
    pageData: {
      trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(getApplicationData(req.session), trustId),
      roleWithinTrustType: RoleWithinTrustType
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
    const trusteeId = req.params[config.ROUTE_PARAM_BENEFICIAL_OWNER_ID];
    const appData: ApplicationData = getApplicationData(req.session);

    const formData: PageModel.IndividualTrusteesFormCommon = mapIndividualTrusteeFromSessionToPage(
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
    const url = `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`;

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

    return safeRedirect(res, url);
  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

export {
  get,
  post,
  INDIVIDUAL_BO_TEXTS,
};

