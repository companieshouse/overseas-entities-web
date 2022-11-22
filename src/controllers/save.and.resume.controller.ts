import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { ApplicationData } from "../model";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { setExtraData } from "../utils/application.data";
import { isActiveFeature } from "../utils/feature.flag";
import { resumeOverseasEntity } from "../service/overseas.entities.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET Save And Resume`);

    const { transactionId, overseaEntityId } = req.query;
    const infoMsg = `Transaction ID: ${transactionId}, OverseasEntity ID: ${overseaEntityId}`;

    logger.infoRequest(req, `Resuming OE - ${infoMsg}`);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      const appData: ApplicationData = await resumeOverseasEntity(req, transactionId as string, overseaEntityId as string);

      if (!appData || !Object.keys(appData).length) {
        throw createAndLogErrorRequest(req, `Error on resuming OE - ${infoMsg}`);
      }

      setExtraData(req.session, appData);
    }

    return res.redirect(config.SOLD_LAND_FILTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
