import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { ApplicationData } from "../model";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { setExtraData } from "../utils/application.data";
import { isActiveFeature } from "../utils/feature.flag";
import { resumeOverseasEntity } from "../service/overseas.entities.service";
import { HasSoldLandKey, IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../model/who.is.making.filing.model";
import { OverseasEntityDueDiligence, OverseasEntityDueDiligenceKey } from "../model/overseas.entity.due.diligence.model";
import { DueDiligence, DueDiligenceKey } from "../model/due.diligence.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET Save And Resume`);

    const { transactionId, overseaEntityId } = req.params;
    const infoMsg = `Transaction ID: ${transactionId}, OverseasEntity ID: ${overseaEntityId}`;

    logger.infoRequest(req, `Resuming OE - ${infoMsg}`);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      const appData: ApplicationData = await resumeOverseasEntity(req, transactionId, overseaEntityId);

      if (!appData || !Object.keys(appData).length) {
        throw createAndLogErrorRequest(req, `Error on resuming OE - ${infoMsg}`);
      }

      // Add default values needed for the web journey that are not part of OE API data model
      appData[HasSoldLandKey] = '0';
      appData[IsSecureRegisterKey] = '0';
      appData[Transactionkey] = transactionId;
      appData[OverseasEntityKey] = overseaEntityId;

      if (Object.keys(appData[OverseasEntityDueDiligenceKey] as OverseasEntityDueDiligence).length) {
        appData[WhoIsRegisteringKey] =  WhoIsRegisteringType.SOMEONE_ELSE;
      } else if (Object.keys(appData[DueDiligenceKey] as DueDiligence).length){
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
