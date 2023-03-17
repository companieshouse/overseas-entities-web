import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
import { safeRedirect } from '../utils/http.ext';
import { getApplicationData, setExtraData } from '../utils/application.data';
import { getTrustByIdFromApp, saveLegalEntityBoInTrust, saveTrustInApp } from '../utils/trusts';
import * as CommonTrustDataMapper from '../utils/trust/common.trust.data.mapper';
import { mapLegalEntityTrusteeFromSessionToPage, mapLegalEntityToSession } from '../utils/trust/legal.entity.beneficial.owner.mapper';
import { RoleWithinTrustType } from '../model/role.within.trust.type.model';
import { ApplicationData } from '../model';
import { CommonTrustData, TrustLegalEntityForm } from '../model/trust.page.model';
import { Session } from '@companieshouse/node-session-handler';
import { saveAndContinue } from '../utils/save.and.continue';

const LEGAL_ENTITY_BO_TEXTS = {
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
  },
  formData?: TrustLegalEntityForm,
};

const getPageProperties = (
  req: Request,
  trustId: string,
  formData?: TrustLegalEntityForm,
): TrustLegalEntityBeneificalOwnerPageProperties => {

  return {
    backLinkUrl: `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`,
    templateName: config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE,
    pageParams: {
      title: LEGAL_ENTITY_BO_TEXTS.title,
    },
    pageData: {
      trustData: CommonTrustDataMapper.mapCommonTrustDataToPage(getApplicationData(req.session), trustId),
      roleWithinTrustType: RoleWithinTrustType
    },
    formData,
  };
};

const get = (req: Request, res: Response, next: NextFunction): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[config.ROUTE_PARAM_TRUSTEE_ID];
    const appData: ApplicationData = getApplicationData(req.session);

    const formData: TrustLegalEntityForm = mapLegalEntityTrusteeFromSessionToPage(
      appData,
      trustId,
      trusteeId
    );
    const pageProps = getPageProperties(req, trustId, formData);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params[config.ROUTE_PARAM_TRUST_ID];

    //  convert form data to application (session) object
    const legalEntityBoData = mapLegalEntityToSession(req.body);

    //  get trust data from session
    let appData: ApplicationData = getApplicationData(req.session);

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

    return safeRedirect(res, `${config.TRUST_ENTRY_URL}/${trustId}${config.TRUST_INVOLVED_URL}`);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

export {
  get,
  post,
  LEGAL_ENTITY_BO_TEXTS,
};
