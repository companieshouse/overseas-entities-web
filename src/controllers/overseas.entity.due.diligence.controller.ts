import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { ApplicationData } from "../model";
import { logger } from "../utils/logger";
import { getApplicationData, setApplicationData, prepareData } from "../utils/application.data";
import { OverseasEntityDueDiligenceKey, OverseasEntityDueDiligenceKeys } from "../model/overseas.entity.due.diligence.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const overseasEntityDueDiligence = appData[OverseasEntityDueDiligenceKey];

    return res.render(config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE, {
      backLinkUrl: config.WHO_IS_MAKING_FILING_URL,
      templateName: config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE,
      ...overseasEntityDueDiligence
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE}`);

    const data = prepareData(req.body, OverseasEntityDueDiligenceKeys);
    setApplicationData(req.session, data, OverseasEntityDueDiligenceKey);

    return res.redirect(config.ENTITY_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
