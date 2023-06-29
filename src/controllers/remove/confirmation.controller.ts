import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { deleteApplicationData, getApplicationData } from "../../utils/application.data";
import { Transactionkey } from "../../model/data.types.model";
import { CONFIRMATION_PAGE, REMOVE_PAYMENT_FEE } from "../../config";
import { WhoIsRegisteringType } from "../../model/who.is.making.filing.model";
import { getLoggedInUserEmail } from "../../utils/session";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const referenceNumber = appData[Transactionkey];

    deleteApplicationData(req.session);

    return res.render(CONFIRMATION_PAGE, {
      isAgentRegistering: appData.who_is_registering === WhoIsRegisteringType.AGENT,
      referenceNumber,
      entityEmail: appData.entity?.email,
      userEmail: getLoggedInUserEmail(req.session),
      verificationCheckDays: 14,
      paymentFee: REMOVE_PAYMENT_FEE,
      isUpdate: true,
      templateName: CONFIRMATION_PAGE
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
