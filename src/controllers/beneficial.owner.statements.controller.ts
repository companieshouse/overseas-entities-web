import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { checkBOsDetailsEntered, checkMOsDetailsEntered, getApplicationData, setExtraData } from "../utils/application.data";
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from "../model/beneficial.owner.statement.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_STATEMENTS_PAGE, {
      backLinkUrl: config.ENTITY_URL,
      templateName: config.BENEFICIAL_OWNER_STATEMENTS_PAGE,
      [BeneficialOwnerStatementKey]: appData[BeneficialOwnerStatementKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const boStatement = req.body[BeneficialOwnerStatementKey];
    const appData: ApplicationData = getApplicationData(req.session);

    if (
      appData[BeneficialOwnerStatementKey] &&
      (
        ( boStatement === BeneficialOwnersStatementType.NONE_IDENTIFIED && checkBOsDetailsEntered(appData) ) ||
        ( boStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS && checkMOsDetailsEntered(appData) )
      )
    ){
      return res.redirect(`${config.BENEFICIAL_OWNER_DELETE_WARNING_URL}?${BeneficialOwnerStatementKey}=${boStatement}`);
    }

    appData[BeneficialOwnerStatementKey] = boStatement;
    setExtraData(req.session, appData);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
