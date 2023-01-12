import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { PaymentKey } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as Session;
  const appData: ApplicationData = getApplicationData(session);
  try {
    logger.debugRequest(req, `GET ${config.UPDATE_CONFIRMATION_URL}`);
    return res.render(config.UPDATE_CONFIRMATION_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.UPDATE_CONFIRMATION_PAGE,
      referenceNumber: appData[PaymentKey]?.reference
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
