import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { Session } from "@companieshouse/node-session-handler";
import { isActiveFeature } from "../../utils/feature.flag";
import { OverseasEntityKey, Transactionkey } from "../../model/data.types.model";

import { createOverseasEntity, updateOverseasEntity } from "../../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../../service/transaction.service";
import { startPaymentsSession } from "../../service/payment.service";

import {
  CHS_URL,
  FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022,
  FEATURE_FLAG_ENABLE_ROE_UPDATE,
  OVERSEAS_ENTITY_QUERY_PAGE,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE
} from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${UPDATE_CHECK_YOUR_ANSWERS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(UPDATE_CHECK_YOUR_ANSWERS_PAGE, {
      backLinkUrl: OVERSEAS_ENTITY_QUERY_PAGE,
      templateName: UPDATE_CHECK_YOUR_ANSWERS_PAGE,
      appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${UPDATE_CHECK_YOUR_ANSWERS_PAGE}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    let transactionID: string, overseasEntityID: string;
    if (!isActiveFeature(FEATURE_FLAG_ENABLE_ROE_UPDATE) && isActiveFeature(FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      transactionID = appData[Transactionkey] as string;
      overseasEntityID = appData[OverseasEntityKey] as string;
      await updateOverseasEntity(req, session);
    } else {
      logger.debug("PAYDEBUG create Transaction");

      transactionID = await postTransaction(req, session);
      overseasEntityID = await createOverseasEntity(req, session, transactionID);
    }

    const transactionClosedResponse = await closeTransaction(req, session, transactionID, overseasEntityID);
    logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);

    const baseURL = `${CHS_URL}${UPDATE_AN_OVERSEAS_ENTITY_URL}`;
    const redirectPath = await startPaymentsSession(req, session, transactionID, overseasEntityID, transactionClosedResponse, baseURL);
    logger.infoRequest(req, `Payments Session created with, Trans_ID: ${transactionID}, OE_ID: ${overseasEntityID}. Redirect to: ${redirectPath}`);

    return res.redirect(redirectPath);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
