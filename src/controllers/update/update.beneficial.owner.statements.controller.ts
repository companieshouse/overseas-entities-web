import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { checkBOsDetailsEntered, checkMOsDetailsEntered, getApplicationData, setExtraData } from "../../utils/application.data";
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from "../../model/beneficial.owner.statement.model";
import { saveAndContinue } from "../../utils/save.and.continue";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_PAGE, {
      backLinkUrl: config.ENTITY_URL,
      templateName: config.BENEFICIAL_OWNER_STATEMENTS_PAGE,
      [BeneficialOwnerStatementKey]: appData[BeneficialOwnerStatementKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    const session = req.session as Session;
    const boStatement = req.body[BeneficialOwnerStatementKey];

    const appData: ApplicationData = getApplicationData(session);

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
    setExtraData(session, appData);
    await saveAndContinue(req, session, false);

    return res.redirect(config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
