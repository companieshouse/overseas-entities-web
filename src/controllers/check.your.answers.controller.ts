import { OverseasEntityCreated } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
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
    const session = req.session as Session;
    logger.debugRequest(req, `POST ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REFRESH_TOKEN_29092022)) {
      const accessToken = await refreshToken(req, session);
      logger.infoRequest(req, `New access token: ${accessToken}`);
    }

    const transaction: Transaction = await postTransaction(req, session);
    logger.infoRequest(req, `Transaction created, ID: ${transaction.id}`);

    const overseaEntity: OverseasEntityCreated = await createOverseasEntity(req, session, transaction.id as string);
    logger.infoRequest(req, `Overseas Entity Created, ID: ${overseaEntity.id}`);

    const transactionClosedResponse = await closeTransaction(req, session, transaction.id as string, overseaEntity.id);
    logger.infoRequest(req, `Transaction Closed, ID: ${transaction.id}`);

    const redirectPath = await startPaymentsSession(req, session, transaction.id as string, overseaEntity.id, transactionClosedResponse);
    logger.infoRequest(req, `Payments Session created with, Trans_ID: ${transaction.id}, OE_ID: ${overseaEntity.id}. Redirect to: ${redirectPath}`);

    return res.redirect(redirectPath);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
