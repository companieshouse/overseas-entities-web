import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { saveAndContinue } from "../utils/save.and.continue";
import { getUrlWithParamsToPath } from "../utils/url";
import { isActiveFeature } from "./feature.flag";

import { EntityNameKey, EntityNumberKey } from "../model/data.types.model";
import { containsTrustData, getTrustArray } from "./trusts";
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from "../model/beneficial.owner.statement.model";

import {
  checkBOsDetailsEntered,
  checkMOsDetailsEntered,
  fetchApplicationData,
  setApplicationData,
} from "../utils/application.data";

export const getBeneficialOwnerStatements = async (
  req: Request,
  res: Response,
  next: NextFunction,
  registrationFlag: boolean,
  noChangeBackLink?: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    let backLinkUrl: string;
    let noChangeFlag: boolean = false;
    let templateName: string;
    const appData: ApplicationData = await fetchApplicationData(req, registrationFlag);

    if (noChangeBackLink) {
      backLinkUrl = noChangeBackLink;
      templateName = config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE;
      noChangeFlag = true;
    } else {
      backLinkUrl = getChangeBackLinkUrl(registrationFlag, appData, req);
      templateName = config.BENEFICIAL_OWNER_STATEMENTS_PAGE;
    }

    return res.render(templateName, {
      backLinkUrl,
      templateName,
      registrationFlag,
      noChangeFlag,
      entity_number: appData[EntityNumberKey],
      entity_name: appData[EntityNameKey],
      [BeneficialOwnerStatementKey]: appData[BeneficialOwnerStatementKey],
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getChangeBackLinkUrl = (registrationFlag: boolean, appData: ApplicationData, req: Request) => {
  let backLinkUrl: string = config.ENTITY_URL;
  if (registrationFlag) {
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      backLinkUrl = getUrlWithParamsToPath(config.ENTITY_WITH_PARAMS_URL, req);
    }
  } else {
    const containsTrusts = containsTrustData(getTrustArray(appData));
    const noTrustsUrl = config.UPDATE_BENEFICIAL_OWNER_TYPE_URL;
    backLinkUrl = containsTrusts ? config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL : noTrustsUrl;
  }
  return backLinkUrl;
};

export const postBeneficialOwnerStatements = async (
  req: Request,
  res: Response,
  next: NextFunction,
  registrationFlag: boolean,
  noChangeRedirectUrl?: string
) => {

  try {

    logger.debugRequest(req, `${req.method} ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const session = req.session as Session;
    const boStatement = req.body[BeneficialOwnerStatementKey];
    const appData: ApplicationData = await fetchApplicationData(req, registrationFlag);
    const redirectUrl = getRedirectUrl(req, registrationFlag, noChangeRedirectUrl);

    if (registrationFlag &&
      appData[BeneficialOwnerStatementKey] &&
      ((boStatement === BeneficialOwnersStatementType.NONE_IDENTIFIED && checkBOsDetailsEntered(appData)) ||
        (boStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS && checkMOsDetailsEntered(appData)))) {
      return res.redirect(`${getWarningRedirectUrl(req)}?${BeneficialOwnerStatementKey}=${boStatement}`);
    }

    appData[BeneficialOwnerStatementKey] = boStatement;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && registrationFlag) {
      await setApplicationData(req, boStatement, BeneficialOwnerStatementKey);
    } else {
      await setApplicationData(session, boStatement, BeneficialOwnerStatementKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getRedirectUrl = (req: Request, registrationFlag: boolean, noChangeRedirectUrl?: string) => {
  let redirectUrl: string;
  if (noChangeRedirectUrl) {
    redirectUrl = noChangeRedirectUrl;
  } else if (registrationFlag) {
    redirectUrl = config.BENEFICIAL_OWNER_TYPE_URL;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      redirectUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
    }
  } else {
    redirectUrl = config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL;
  }
  return redirectUrl;
};

const getWarningRedirectUrl = (req: Request) => {
  let warningRedirectUrl = config.BENEFICIAL_OWNER_DELETE_WARNING_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    warningRedirectUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_DELETE_WARNING_WITH_PARAMS_URL, req);
  }
  return warningRedirectUrl;
};
