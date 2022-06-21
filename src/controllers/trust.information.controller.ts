import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { TrustKey } from "../model/trust.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.TRUST_INFO_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.TRUST_INFO_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE,
      templateName: config.TRUST_INFO_PAGE,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.TRUST_INFO_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);
    appData[TrustKey]?.push(req.body[TrustKey]);
    setExtraData(req.session, appData);
    console.log(appData);

    /* if (req.body.hasOwnProperty("add")) {
      console.log("Add button pressed");
    }
    if (req.body.hasOwnProperty("submit")) {
      console.log("Submit button pressed");
    } */
    return res.redirect(config.CHECK_YOUR_ANSWERS_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }

  return res.redirect("TODO");
};
