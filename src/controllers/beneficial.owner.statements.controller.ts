import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { BeneficialOwnerStatementKey } from "../model/beneficial.owner.statement.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_STATEMENTS_PAGE, {
      backLinkUrl: config.ENTITY_URL,
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

    const appData: ApplicationData = getApplicationData(req.session);
    appData[BeneficialOwnerStatementKey] = req.body[BeneficialOwnerStatementKey];
    setExtraData(req.session, appData);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
