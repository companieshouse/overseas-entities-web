import { NextFunction, Request, Response } from "express";

import { logger, createAndLogErrorRequest } from "../utils/logger";
import { CHECK_YOUR_ANSWERS_URL, CONFIRMATION_URL, PAYMENT_PAID } from "../config";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { PaymentKey } from "../model/payment.type.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, state, overseaEntityId } = req.query;

    const appData: ApplicationData = getApplicationData(req.session);
    const savedState = appData[PaymentKey]?.state;

    logger.debugRequest(req, `Returned state: ${ state }, saved state: ${savedState}`);

    if ( !savedState || savedState !== state) {
      return next(createAndLogErrorRequest(req, `
        Rejecting redirect, state does not match.
        Payment Request:  ${ JSON.stringify(appData[PaymentKey]) }
      `));
    }

    if (status === PAYMENT_PAID) {
      logger.debugRequest(req, `
        OE id: ${ overseaEntityId },
        Payment status: ${status},
        Redirecting to: ${CONFIRMATION_URL}
      `);
      return res.redirect(CONFIRMATION_URL);
    } else {
      logger.debugRequest(req, `
        OE id: ${ overseaEntityId },
        Payment status: ${status},
        Redirecting to: ${CHECK_YOUR_ANSWERS_URL}
      `);
      return res.redirect(CHECK_YOUR_ANSWERS_URL);
    }
  } catch (e) {
    return next(e);
  }
};
