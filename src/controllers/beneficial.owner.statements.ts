import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, beneficialOwnerStatementType } from "../model";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {

  try {
    logger.debug(`GET ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(config.BENEFICIAL_OWNER_STATEMENTS_PAGE, {
      backLinkUrl: config.ENTITY_URL,
      ...appData.beneficialOwnerStatement
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);
    const data: ApplicationDataType = prepareData(req.body, beneficialOwnerStatementType.BeneficialOwnerStatementKeys);
    setApplicationData(req.session, data, beneficialOwnerStatementType.BeneficialOwnerStatementKey);
    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
