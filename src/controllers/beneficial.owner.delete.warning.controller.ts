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
import { BeneficialOwnerGovKey } from "../model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import { ManagingOfficerCorporateKey } from "../model/managing.officer.corporate.model";
import { ManagingOfficerKey } from "../model/managing.officer.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}`);

    const beneficialOwnerStatement = req.query[BeneficialOwnerStatementKey] as string;
    if (!BeneficialOwnersStatementTypes.includes(beneficialOwnerStatement)) {
      throw createAndLogErrorRequest(req, "Beneficial Owner Statement type not included or incorrect");
    }

    return res.render(config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_STATEMENTS_URL,
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
        appData[BeneficialOwnerOtherKey] = [];
        appData[BeneficialOwnerGovKey] = [];
      } else if ( boStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS && checkMOsDetailsEntered(appData) ) {
        appData[ManagingOfficerKey] = [];
        appData[ManagingOfficerCorporateKey] = [];
      }

      appData[BeneficialOwnerStatementKey] = boStatement;

      setExtraData(req.session, appData);
      return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
    }

    return res.redirect(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
