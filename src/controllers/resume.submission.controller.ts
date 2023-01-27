import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";

import { ApplicationData } from "../model";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { setDefaultRegistrationValues, setExtraData } from "../utils/application.data";
import { isActiveFeature } from "../utils/feature.flag";
import { getOverseasEntity } from "../service/overseas.entities.service";
import { startPaymentsSession } from "../service/payment.service";
import { getTransaction } from "../service/transaction.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET a saved OE submission`);

    const { transactionId, overseaEntityId } = req.params;
    const infoMsg = `Transaction ID: ${transactionId}, OverseasEntity ID: ${overseaEntityId}`;

    logger.infoRequest(req, `Resuming OE - ${infoMsg}`);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      const appData: ApplicationData = await getOverseasEntity(req, transactionId, overseaEntityId);

      if (!Object.keys(appData || {}).length) {
        throw createAndLogErrorRequest(req, `Error on resuming OE - ${infoMsg}`);
      }

      const session = req.session as Session;
      setWebApplicationData(session, appData, transactionId, overseaEntityId);

      const transactionResource = await getTransaction(req, transactionId);

      if (transactionResource.status === config.CLOSED_PENDING_PAYMENT) {
        const headersPaymentUrl = {
          headers: {
            [config.PAYMENT_REQUIRED_HEADER]: config.PAYMENTS_API_URL + config.PAYMENTS
          }
        };
        const redirectPath = await startPaymentsSession(req, session, transactionId, overseaEntityId, headersPaymentUrl);

        logger.infoRequest(req, `Payments Session created on Resume link with, Trans_ID: ${transactionId}, OE_ID: ${overseaEntityId}. Redirect to: ${redirectPath}`);

        return res.redirect(redirectPath);
      }
    }

    return res.redirect(config.SOLD_LAND_FILTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

/**
 * Set default values needed for the web journey that are not part of OE API data model
 * nor part of the SDK mapper object.
 * Add IDs needed for the web to select single BOs or MOs on beneficial-owner-type screen and
 * related checkboxes for different pages
 * @param session
 * @param appData
 * @param transactionId
 * @param overseaEntityId
 */
const setWebApplicationData = (session: Session, appData: ApplicationData, transactionId: string, overseaEntityId: string) => {

  setDefaultRegistrationValues(appData, transactionId, overseaEntityId);

  setExtraData(session, appData);
};
