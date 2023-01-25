import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import { RoleWithinTrustType } from '../model/role.within.trust.type.model';
import { getApplicationData, setExtraData } from '../utils/application.data';
import { getTrustByIdFromApp, saveTrustInApp, saveIndividualTrusteeInTrust } from '../../src/utils/trusts';
import * as PageModel from '../model/trust.page.model';
import { ApplicationData } from '../model';
import { mapIndividualTrusteeToSession } from '../utils/trust/individual.trustee.mapper';
import { safeRedirect } from '../utils/http.ext';

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
};

const getPageProperties = (
  req: Request,
  formData?: PageModel.IndividualTrusteesFormCommon,
): TrustIndividualBeneificalOwnerPageProperties => {
  const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

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
  };
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const pageProps = getPageProperties(req);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    return next(error);
  }
};

const post = (
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

    const trustUpdate = saveIndividualTrusteeInTrust(
      getTrustByIdFromApp(appData, trustId),
      individualTrusteeData
    );

    //  update trust in application data
    appData = saveTrustInApp(appData, trustUpdate);

    // save to session
    setExtraData(req.session, appData);

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

