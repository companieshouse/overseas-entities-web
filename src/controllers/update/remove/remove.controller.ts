import { NextFunction, Request, Response } from "express";
import * as config from "../../../config";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationData } from "../../../model";
import {
  getApplicationData,
  mapFieldsToDataObject,
  setExtraData
} from "../../../utils/application.data";
import { logger } from "../../../utils/logger";
import { InputDateKeys, IsRemoveEntityKey, OverseasEntityKey, Transactionkey } from "../../../model/data.types.model";
import { createOverseasEntity, updateOverseasEntity } from "../../../service/overseas.entities.service";
import { isActiveFeature } from "../../../utils/feature.flag";
import { postTransaction } from "../../../service/transaction.service";
import { FilingDateKey, FilingDateKeys } from "../../../model/date.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    return res.render(config.UPDATE_REMOVE_PAGE, {
      company: appData.entity_name
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove = req.body[IsRemoveEntityKey];
    const session = req.session as Session;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME)) {
      const appData: ApplicationData = getApplicationData(session);
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID, true);
      }
      if (appData.update) {
        appData.update[FilingDateKey] = mapFieldsToDataObject(req.body, FilingDateKeys, InputDateKeys);
      }
      setExtraData(session, { ...getApplicationData(req.session), [IsRemoveEntityKey]: isRemove });
      await updateOverseasEntity(req, session);
    }
    return res.redirect(config.UPDATE_FILING_DATE_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
