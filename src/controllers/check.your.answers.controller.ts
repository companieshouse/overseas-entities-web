import { OverseasEntityCreated } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";

import { createOverseasEntity } from "../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../service/transaction.service";

import * as config from "../config";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);
  return res.render(config.CHECK_YOUR_ANSWERS_PAGE, {
    backLinkUrl: config.MANAGING_OFFICER_CORPORATE_URL
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const transaction: Transaction = await postTransaction(req.session as Session);
    const overseaEntity: OverseasEntityCreated = await createOverseasEntity(req.session as Session, transaction.id as string);
    await closeTransaction(req.session as Session, transaction.id as string, overseaEntity.id);

    return res.redirect(config.CONFIRMATION_URL);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
