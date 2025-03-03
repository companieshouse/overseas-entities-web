import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { isActiveFeature } from "../utils/feature.flag";
import { BeneficialOwnerGovKey } from "../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import { ManagingOfficerCorporateKey } from "../model/managing.officer.corporate.model";
import { ManagingOfficerKey } from "../model/managing.officer.model";
import { TrustKey } from "../model/trust.model";
import { updateOverseasEntity } from "../service/overseas.entities.service";

import { getUrlWithParamsToPath, isRegistrationJourney } from "../utils/url";

import {
  setExtraData,
  fetchApplicationData,
  checkBOsDetailsEntered,
  checkMOsDetailsEntered,
} from "../utils/application.data";

import {
  BeneficialOwnersStatementType,
  BeneficialOwnersStatementTypes,
  BeneficialOwnerStatementKey
} from "../model/beneficial.owner.statement.model";

export const get = (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}`);

    const beneficialOwnerStatement = req.query[BeneficialOwnerStatementKey] as string;
    if (!beneficialOwnerStatement || !BeneficialOwnersStatementTypes.includes(beneficialOwnerStatement)) {
      throw createAndLogErrorRequest(req, "Beneficial Owner Statement type not included or incorrect");
    }
    const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
      ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL, req)
      : config.BENEFICIAL_OWNER_STATEMENTS_URL;
    return res.render(config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE, {
      backLinkUrl,
      templateName: config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE,
      [BeneficialOwnerStatementKey]: beneficialOwnerStatement
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {

    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}`);
    let nextPageUrl: string;

    if (req.body["delete_beneficial_owners"] === '1') {
      const boStatement = req.body[BeneficialOwnerStatementKey];
      const isRegistration: boolean = isRegistrationJourney(req);
      const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

      if (boStatement === BeneficialOwnersStatementType.NONE_IDENTIFIED && checkBOsDetailsEntered(appData)) {
        appData[BeneficialOwnerIndividualKey] = [];
        appData[TrustKey] = [];
        appData[BeneficialOwnerOtherKey] = [];
        appData[BeneficialOwnerGovKey] = [];
      } else if (boStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS && checkMOsDetailsEntered(appData)) {
        appData[ManagingOfficerKey] = [];
        appData[ManagingOfficerCorporateKey] = [];
      }

      appData[BeneficialOwnerStatementKey] = boStatement;

      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
        await updateOverseasEntity(req, req.session as Session, appData);
      }
      setExtraData(req.session, appData);
      nextPageUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
        ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
        : config.BENEFICIAL_OWNER_TYPE_URL;

      return res.redirect(nextPageUrl);
    }

    nextPageUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
      ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL, req)
      : config.BENEFICIAL_OWNER_STATEMENTS_URL;

    return res.redirect(nextPageUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
