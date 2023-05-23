import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import { Session } from "@companieshouse/node-session-handler";

import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { isActiveFeature } from "../../utils/feature.flag";
import { createOverseasEntity } from "../../service/overseas.entities.service";
import { OverseasEntityKey, Transactionkey } from "../../model/data.types.model";
import { closeTransaction, postTransaction } from "../../service/transaction.service";
import { startPaymentsSession } from "../../service/payment.service";

import {
  CHS_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE,
  FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME,
  OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
  OVERSEAS_ENTITY_SECTION_HEADING,
  WHO_IS_MAKING_UPDATE_URL
} from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    const changeLinkUrl: string = OVERSEAS_ENTITY_UPDATE_DETAILS_URL;
    const overseasEntityHeading: string = OVERSEAS_ENTITY_SECTION_HEADING;
    const whoIsCompletingChangeLink: string = WHO_IS_MAKING_UPDATE_URL;

    return res.render(UPDATE_CHECK_YOUR_ANSWERS_PAGE, {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
      templateName: UPDATE_CHECK_YOUR_ANSWERS_PAGE,
      changeLinkUrl,
      overseasEntityHeading,
      whoIsCompletingChangeLink,
      appData,
      pageParams: {
        isRegistration: false
      },
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    let transactionID, overseasEntityID;
    if (isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME)) {
      transactionID = appData[Transactionkey] as string;
      overseasEntityID = appData[OverseasEntityKey] as string;
    } else {
      transactionID = await postTransaction(req, session);
      overseasEntityID = await createOverseasEntity(req, session, transactionID);
    }

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
