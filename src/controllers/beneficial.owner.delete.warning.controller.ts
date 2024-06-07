import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { ApplicationData } from "../model";
import {
  checkBOsDetailsEntered,
  checkMOsDetailsEntered,
  getApplicationData,
  setExtraData
} from "../utils/application.data";
import { createAndLogErrorRequest, logger } from "../utils/logger";

import {
  BeneficialOwnersStatementType,
  BeneficialOwnersStatementTypes,
  BeneficialOwnerStatementKey
} from "../model/beneficial.owner.statement.model";
import { isActiveFeature } from "../utils/feature.flag";
import { BeneficialOwnerGovKey } from "../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import { ManagingOfficerCorporateKey } from "../model/managing.officer.corporate.model";
import { ManagingOfficerKey } from "../model/managing.officer.model";
import { TrustKey } from "../model/trust.model";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}`);

    const beneficialOwnerStatement = req.query[BeneficialOwnerStatementKey] as string;
    if (!beneficialOwnerStatement || !BeneficialOwnersStatementTypes.includes(beneficialOwnerStatement)) {
      throw createAndLogErrorRequest(req, "Beneficial Owner Statement type not included or incorrect");
    }
    const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL, req) : config.BENEFICIAL_OWNER_STATEMENTS_URL;
    return res.render(config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE, {
      backLinkUrl,
      templateName: config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE,
      [BeneficialOwnerStatementKey]: beneficialOwnerStatement
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}`);

    if (req.body["delete_beneficial_owners"] === '1') {
      const boStatement = req.body[BeneficialOwnerStatementKey];
      const appData: ApplicationData = getApplicationData(req.session);

      if ( boStatement === BeneficialOwnersStatementType.NONE_IDENTIFIED && checkBOsDetailsEntered(appData) ) {
        appData[BeneficialOwnerIndividualKey] = [];
        appData[TrustKey] = [];
        appData[BeneficialOwnerOtherKey] = [];
        appData[BeneficialOwnerGovKey] = [];
      } else if ( boStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS && checkMOsDetailsEntered(appData) ) {
        appData[ManagingOfficerKey] = [];
        appData[ManagingOfficerCorporateKey] = [];
      }

      appData[BeneficialOwnerStatementKey] = boStatement;

      setExtraData(req.session, appData);
      let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
      }

      return res.redirect(nextPageUrl);
    }

    return res.redirect(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
