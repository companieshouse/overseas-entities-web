import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { ApplicationData } from "../model";
import { logger } from "../utils/logger";
import { getApplicationData, setApplicationData, prepareData } from "../utils/application.data";
import { DueDiligenceKey, DueDiligenceKeys } from "../model/due.diligence.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.DUE_DILIGENCE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const dueDiligence = appData[DueDiligenceKey];

    return res.render(config.DUE_DILIGENCE_PAGE, {
      backLinkUrl: config.WHO_IS_MAKING_FILING_URL,
      templateName: config.DUE_DILIGENCE_PAGE,
      ...dueDiligence
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.DUE_DILIGENCE_PAGE}`);

    const data = prepareData(req.body, DueDiligenceKeys);
    setApplicationData(req.session, data, DueDiligenceKey);

    return res.redirect(config.ENTITY_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
