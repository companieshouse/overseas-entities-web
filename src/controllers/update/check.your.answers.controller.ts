import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import { Session } from "@companieshouse/node-session-handler";

import { createOverseasEntity } from "../../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../../service/transaction.service";
import { startPaymentsSession } from "../../service/payment.service";

import {
  CHS_URL,
  OVERSEAS_ENTITY_REVIEW_URL,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE
} from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(UPDATE_CHECK_YOUR_ANSWERS_PAGE, {
      backLinkUrl: OVERSEAS_ENTITY_REVIEW_URL,
      templateName: UPDATE_CHECK_YOUR_ANSWERS_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;

    const transactionID = await postTransaction(req, session);
    const overseasEntityID = await createOverseasEntity(req, session, transactionID);

    const transactionClosedResponse = await closeTransaction(req, session, transactionID, overseasEntityID);
    logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);

    const baseURL = `${CHS_URL}${UPDATE_AN_OVERSEAS_ENTITY_URL}`;
    const redirectPath = await startPaymentsSession(
      req,
      session,
      transactionID,
      overseasEntityID,
      transactionClosedResponse,
      baseURL
    );

    logger.infoRequest(req, `Payments Session created with, Trans_ID: ${transactionID}, OE_ID: ${overseasEntityID}. Redirect to: ${redirectPath}`);

    return res.redirect(redirectPath);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
