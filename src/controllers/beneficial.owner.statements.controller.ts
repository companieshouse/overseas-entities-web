import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { BeneficialOwnerStatementKey } from "../model/beneficial.owner.statement.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_STATEMENTS_PAGE, {
      backLinkUrl: config.ENTITY_URL,
      beneficial_owners_statement: appData.beneficial_owners_statement
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);
    appData[BeneficialOwnerStatementKey] = req.body[BeneficialOwnerStatementKey];
    setExtraData(req.session, appData);

    console.log(JSON.parse(JSON.stringify(appData)));
    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
