import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";

import { createOverseasEntity } from "../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../service/transaction.service";

import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";
import { logger } from "../utils/logger";
import { checkEntityHasTrusts } from "../utils/trusts";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { startPaymentsSession } from "../service/payment.service";
import { refreshToken } from "../service/refresh.token.service";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    let hasTrusts: boolean = false;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUST_INFO_16062022)) {
      hasTrusts = checkEntityHasTrusts(appData);
    }

    logger.infoRequest(req, `${config.CHECK_YOUR_ANSWERS_PAGE} hasTrusts=${hasTrusts}`);

    let backLinkUrl: string = config.BENEFICIAL_OWNER_TYPE_URL;
    if (hasTrusts) {
      backLinkUrl = config.TRUST_INFO_PAGE;
    }

    return res.render(config.CHECK_YOUR_ANSWERS_PAGE, {
      backLinkUrl,
      templateName: config.CHECK_YOUR_ANSWERS_PAGE,
      hasTrusts,
      appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REFRESH_TOKEN_29092022)) {
      const accessToken = await refreshToken(req, session);
      logger.infoRequest(req, `New access token: ${accessToken}`);
    }

    const isSaveAndResumeFeatureActive = isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022);
    const transactionID = (!isSaveAndResumeFeatureActive)
      ? await postTransaction(req, session)
      : appData.transaction_id as string;

    const overseaEntityID = (!isSaveAndResumeFeatureActive)
      ? await createOverseasEntity(req, session, transactionID)
      : appData.overseas_entity_id as string;

    const transactionClosedResponse = await closeTransaction(req, session, transactionID, overseaEntityID);
    logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);

    const redirectPath = await startPaymentsSession(req, session, transactionID, overseaEntityID, transactionClosedResponse);
    logger.infoRequest(req, `Payments Session created with, Trans_ID: ${transactionID}, OE_ID: ${overseaEntityID}. Redirect to: ${redirectPath}`);

    return res.redirect(redirectPath);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
