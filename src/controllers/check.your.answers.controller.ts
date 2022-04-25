import { OverseasEntityCreated } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";

import { createOverseasEntity } from "../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../service/transaction.service";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.CHECK_YOUR_ANSWERS_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
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

    const transaction: Transaction = await postTransaction(req, req.session as Session);
    logger.infoRequest(req, `Transaction created, ID: ${transaction.id}`);

    const overseaEntity: OverseasEntityCreated = await createOverseasEntity(req, req.session as Session, transaction.id as string);
    logger.infoRequest(req, `Overseas Entity Created, ID: ${overseaEntity.id}`);

    await closeTransaction(req, req.session as Session, transaction.id as string, overseaEntity.id);
    logger.infoRequest(req, `Transaction Closed, ID: ${transaction.id}`);

    return res.redirect(config.CONFIRMATION_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
