import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType } from "../model";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";
import { TrustKey, TrustKeys } from "../model/trust.model";

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

    const data: ApplicationDataType = setTrustData(req.body);
    console.log("THIS IS THE TRUSTS IN THE REQ BODY", req.body[TrustKey]);
    setApplicationData(req.session, data, TrustKey);
    console.log("THIS IS THE SESSION: ", req.session?.data.extra_data.roe);

    if (req.body.add) {
      return res.redirect(config.TRUST_INFO_URL);
    }
    if (req.body.submit) {
      return res.redirect(config.CHECK_YOUR_ANSWERS_PAGE);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setTrustData = (reqBody: any): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, TrustKeys);

  data[TrustKey] = reqBody[TrustKey];

  return data;
};
