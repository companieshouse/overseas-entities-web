import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { checkBOsDetailsEntered, checkMOsDetailsEntered, getApplicationData, setExtraData } from "../utils/application.data";
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from "../model/beneficial.owner.statement.model";
import { saveAndContinue } from "../utils/save.and.continue";

export const getBeneficialOwnerStatements = (req: Request, res: Response, next: NextFunction, registrationFlag: boolean) => {
  try {
    const PAGE_NAME = registrationFlag ? config.BENEFICIAL_OWNER_STATEMENTS_PAGE : config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_PAGE;
    const BACK_LINK = registrationFlag ? config.ENTITY_URL : config.OVERSEAS_ENTITY_REVIEW_URL;
    logger.debugRequest(req, `GET ${PAGE_NAME}`);

    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(PAGE_NAME, {
      backLinkUrl: BACK_LINK,
      templateName: PAGE_NAME,
      [BeneficialOwnerStatementKey]: appData[BeneficialOwnerStatementKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postBeneficialOwnerStatements = async (req: Request, res: Response, next: NextFunction, registrationFlag: boolean) => {
  try {
    const PAGE_NAME = registrationFlag ? config.BENEFICIAL_OWNER_STATEMENTS_PAGE : config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_PAGE;
    const REDIRECT_URL = registrationFlag ? config.BENEFICIAL_OWNER_TYPE_URL : config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL;

    logger.debugRequest(req, `POST ${PAGE_NAME}`);

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
    await saveAndContinue(req, session, false);

    return res.redirect(REDIRECT_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
