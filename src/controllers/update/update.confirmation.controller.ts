import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getLoggedInUserEmail } from "../../utils/session";
import { deleteApplicationData, getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model/application.model";
import { Transactionkey } from "../../model/data.types.model";
import { WhoIsRegisteringType } from "../../model/who.is.making.filing.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.UPDATE_CONFIRMATION_URL}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const referenceNumber = appData[Transactionkey];

    deleteApplicationData(req.session);

    return res.render(config.UPDATE_CONFIRMATION_PAGE, {
      isAgentRegistering: appData.who_is_registering === WhoIsRegisteringType.AGENT,
      referenceNumber,
      entityEmail: appData.entity?.email,
      userEmail: getLoggedInUserEmail(req.session),
      verificationCheckDays: 14,
      templateName: config.UPDATE_CONFIRMATION_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
