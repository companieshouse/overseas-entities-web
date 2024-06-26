import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { deleteApplicationData, getApplicationData, setExtraData } from "../utils/application.data";
import { HasSoldLandKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { getSoldLandFilterBackLink } from "../utils/navigation";
import { isActiveFeature } from "../utils/feature.flag";
import { postTransaction } from "../service/transaction.service";
import { createOverseasEntity, updateOverseasEntity } from "../service/overseas.entities.service";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SOLD_LAND_FILTER_PAGE}`);

    if (req.query[config.LANDING_PAGE_QUERY_PARAM] === '0') {
      deleteApplicationData(req.session);
    }

    const appData: ApplicationData = await getApplicationData(req.session);

    return res.render(config.SOLD_LAND_FILTER_PAGE, {
      backLinkUrl: await getSoldLandFilterBackLink(),
      templateName: config.SOLD_LAND_FILTER_PAGE,
      [HasSoldLandKey]: appData?.[HasSoldLandKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SOLD_LAND_FILTER_PAGE}`);

    const session = req.session as Session;
    const hasSoldLand = req.body[HasSoldLandKey];
    const appData: ApplicationData = await getApplicationData(session, req);
    appData[HasSoldLandKey] = hasSoldLand;

    let nextPageUrl: string = "";

    if (hasSoldLand !== '0') {
      nextPageUrl = config.CANNOT_USE_URL;
    } else {
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID, true, appData);
      } else {
        await updateOverseasEntity(req, session, appData);
      }
      nextPageUrl = config.SECURE_REGISTER_FILTER_URL;
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        nextPageUrl = getUrlWithTransactionIdAndSubmissionId(config.SECURE_REGISTER_FILTER_WITH_PARAMS_URL, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
      }
    }
    setExtraData(session, appData);
    return res.redirect(nextPageUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
