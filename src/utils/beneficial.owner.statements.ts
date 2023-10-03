import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { checkBOsDetailsEntered, checkMOsDetailsEntered, getApplicationData, setExtraData } from "../utils/application.data";
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from "../model/beneficial.owner.statement.model";
import { EntityNameKey, EntityNumberKey } from "../model/data.types.model";
import { saveAndContinue } from "../utils/save.and.continue";
import { getUrlWithParamsToPath } from "../utils/url";
import { isActiveFeature } from "./feature.flag";
import { containsTrustData, getTrustArray } from "./trusts";

export const getBeneficialOwnerStatements = (req: Request, res: Response, next: NextFunction, registrationFlag: boolean, noChangeBackLink?: string) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    let backLinkUrl: string;
    let statementValidationFlag: boolean = false;
    let noChangeFlag: boolean = false;
    let templateName: string;
    const appData = getApplicationData(req.session);
    if (noChangeBackLink) {
      backLinkUrl = noChangeBackLink;
      templateName = config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE;
      noChangeFlag = true;
    } else {
      statementValidationFlag = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION);
      backLinkUrl = getChangeBackLinkUrl(registrationFlag, statementValidationFlag, appData);
      templateName = config.BENEFICIAL_OWNER_STATEMENTS_PAGE;
    }
    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      [BeneficialOwnerStatementKey]: appData[BeneficialOwnerStatementKey],
      registrationFlag,
      statementValidationFlag,
      noChangeFlag,
      entity_number: appData[EntityNumberKey],
      entity_name: appData[EntityNameKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getChangeBackLinkUrl = (registrationFlag: boolean, statementValidationFlag: boolean, appData: ApplicationData) => {
  if (registrationFlag) {
    return config.ENTITY_URL;
  } else {
    const containsTrusts = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_TRUSTS) && containsTrustData(getTrustArray(appData));
    const noTrustsUrl = statementValidationFlag ? config.UPDATE_BENEFICIAL_OWNER_TYPE_URL : config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL;
    return containsTrusts ? config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL : noTrustsUrl;
  }
};

export const postBeneficialOwnerStatements = async (req: Request, res: Response, next: NextFunction, registrationFlag: boolean, noChangeRedirectUrl?: string) => {
  try {
    const REDIRECT_URL = getRedirectUrl(req, registrationFlag, noChangeRedirectUrl);
    logger.debugRequest(req, `${req.method} ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const session = req.session as Session;
    const boStatement = req.body[BeneficialOwnerStatementKey];
    const appData: ApplicationData = getApplicationData(session);

    if (
      registrationFlag &&
      appData[BeneficialOwnerStatementKey] &&
      (
        (boStatement === BeneficialOwnersStatementType.NONE_IDENTIFIED && checkBOsDetailsEntered(appData)) ||
        (boStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS && checkMOsDetailsEntered(appData))
      )
    ) {
      return res.redirect(`${config.BENEFICIAL_OWNER_DELETE_WARNING_URL}?${BeneficialOwnerStatementKey}=${boStatement}`);
    }

    appData[BeneficialOwnerStatementKey] = boStatement;
    setExtraData(session, appData);
    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(REDIRECT_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
const getRedirectUrl = (req: Request, registrationFlag: boolean, noChangeRedirectUrl?: string) => {
  let REDIRECT_URL: string;
  if (noChangeRedirectUrl) {
    REDIRECT_URL = noChangeRedirectUrl;
  } else if (registrationFlag){
    REDIRECT_URL = config.BENEFICIAL_OWNER_TYPE_URL;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
      REDIRECT_URL = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
    }
  } else {
    REDIRECT_URL = config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL;
  }
  return REDIRECT_URL;
};
