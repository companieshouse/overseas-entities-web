import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { ApplicationData } from "../model";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { setExtraData } from "../utils/application.data";
import { isActiveFeature } from "../utils/feature.flag";
import { resumeOverseasEntity } from "../service/overseas.entities.service";
import { HasSoldLandKey, IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../model/who.is.making.filing.model";
import { OverseasEntityDueDiligenceKey } from "../model/overseas.entity.due.diligence.model";
import { DueDiligenceKey } from "../model/due.diligence.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET Save And Resume`);

    const { transactionId, overseaEntityId } = req.params;
    const infoMsg = `Transaction ID: ${transactionId}, OverseasEntity ID: ${overseaEntityId}`;

    logger.infoRequest(req, `Resuming OE - ${infoMsg}`);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      const appData: ApplicationData = await resumeOverseasEntity(req, transactionId as string, overseaEntityId as string);

      if (!appData || !Object.keys(appData).length) {
        throw createAndLogErrorRequest(req, `Error on resuming OE - ${infoMsg}`);
      }

      appData[HasSoldLandKey] = '0';
      appData[IsSecureRegisterKey] = '0';
      appData[Transactionkey] = transactionId;
      appData[OverseasEntityKey] = overseaEntityId;

      if (Object.keys(appData[OverseasEntityDueDiligenceKey] || {} ).length) {
        appData[WhoIsRegisteringKey] =  WhoIsRegisteringType.SOMEONE_ELSE;
      } else if (Object.keys(appData[DueDiligenceKey] || {} ).length){
        appData[WhoIsRegisteringKey] = WhoIsRegisteringType.AGENT;
      }

      setExtraData(req.session, appData);
    }

    return res.redirect(config.SOLD_LAND_FILTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
