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
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const hasTrusts: boolean = checkEntityHasTrusts(appData);

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
    const transactionID = (isSaveAndResumeFeatureActive)
      ? appData[Transactionkey] as string
      : await postTransaction(req, session);

    const overseasEntityID = (isSaveAndResumeFeatureActive)
      ? appData[OverseasEntityKey] as string
      : await createOverseasEntity(req, session, transactionID);

    // TODO: Missing last put call to submit OE, it will be done on ROE-1441.
    // Note: this will be removed in the future when all PUT calls have been set correctly on the others pages.

    const transactionClosedResponse = await closeTransaction(req, session, transactionID, overseasEntityID);
    logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);

    const redirectPath = await startPaymentsSession(req, session, transactionID, overseasEntityID, transactionClosedResponse);
    logger.infoRequest(req, `Payments Session created with, Trans_ID: ${transactionID}, OE_ID: ${overseasEntityID}. Redirect to: ${redirectPath}`);

    return res.redirect(redirectPath);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
