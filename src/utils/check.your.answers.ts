import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import { Session } from "@companieshouse/node-session-handler";

import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { isActiveFeature } from "../utils/feature.flag";
import { createOverseasEntity } from "../service/overseas.entities.service";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { closeTransaction, postTransaction } from "../service/transaction.service";
import { startPaymentsSession } from "../service/payment.service";
import { fetchOverseasEntityEmailAddress } from "../utils/update/fetchOverseasEntityEmail";

import {
  OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
  OVERSEAS_ENTITY_SECTION_HEADING,
  WHO_IS_MAKING_UPDATE_URL,
  FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  CHS_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL
} from "../config";

export const getDataForReview = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string, noChangeFlag?: boolean) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    if (noChangeFlag) {
      await fetchOverseasEntityEmailAddress(appData, req, session);
    }

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      changeLinkUrl: OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
      overseasEntityHeading: OVERSEAS_ENTITY_SECTION_HEADING,
      whoIsCompletingChangeLink: WHO_IS_MAKING_UPDATE_URL,
      appData,
      pageParams: {
        isRegistration: false,
        noChangeFlag
      },
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postDataForReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const noChangeReviewStatement = req.body["no_change_review_statement"];

    if (noChangeReviewStatement === "0") {
      return res.redirect(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
    }

    let transactionID: string, overseasEntityID: string;
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
