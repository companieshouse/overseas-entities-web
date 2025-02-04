import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { getLoggedInUserEmail } from "../utils/session";
import { ApplicationData } from "../model/application.model";
import { WhoIsRegisteringType } from "../model/who.is.making.filing.model";
import { isRegistrationJourney } from "../utils/url";
import { deleteApplicationData, fetchApplicationData } from "../utils/application.data";
import { Transactionkey } from "../model/data.types.model";
import { CONFIRMATION_PAGE, PAYMENT_FEE } from "../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${CONFIRMATION_PAGE}`);

    const isRegistration: boolean = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration, true);
    const referenceNumber = appData[Transactionkey];

    deleteApplicationData(req.session);

    return res.render(CONFIRMATION_PAGE, {
      isAgentRegistering: appData.who_is_registering === WhoIsRegisteringType.AGENT,
      referenceNumber,
      entityEmail: appData.entity?.email,
      userEmail: getLoggedInUserEmail(req.session),
      verificationCheckDays: 14,
      paymentFee: PAYMENT_FEE,
      templateName: CONFIRMATION_PAGE
    });
  } catch (error: any) {
    logger.errorRequest(req, error);
    next(error);
  }
};
