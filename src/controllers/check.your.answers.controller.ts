import { OverseasEntityCreated } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { NextFunction, Request, Response } from "express";

import { createOverseasEntity } from "../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../service/transaction.service";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { Session } from "@companieshouse/node-session-handler";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.CHECK_YOUR_ANSWERS_PAGE, {
      backLinkUrl: config.MANAGING_OFFICER_CORPORATE_URL,
      appData
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const transaction: Transaction = await postTransaction(req, req.session as Session);
    const overseaEntity: OverseasEntityCreated = await createOverseasEntity(req, req.session as Session, transaction.id as string);
    await closeTransaction(req, req.session as Session, transaction.id as string, overseaEntity.id);

    return res.redirect(config.CONFIRMATION_URL);
  } catch (error) {
    next(error);
  }
};
