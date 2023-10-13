import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";
import { ApplicationData } from "../model";
import { logger } from "../utils/logger";
import { isActiveFeature } from "../utils/feature.flag";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { postTransaction } from "../service/transaction.service";
import { createOverseasEntity, updateOverseasEntity } from "../service/overseas.entities.service";
import { EntityNameKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { getUrlWithParamsToPath, transactionIdAndSubmissionIdExistInRequest } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_NAME_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    let backLinkUrl = config.INTERRUPT_CARD_URL;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && transactionIdAndSubmissionIdExistInRequest(req)){
      backLinkUrl = getUrlWithParamsToPath(config.INTERRUPT_CARD_WITH_PARAMS_URL, req);
    }

    return res.render(config.OVERSEAS_NAME_PAGE, {
      backLinkUrl: backLinkUrl,
      templateName: config.OVERSEAS_NAME_PAGE,
      [EntityNameKey]: appData?.[EntityNameKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_NAME_PAGE}`);

    const session = req.session as Session;
    const entityName = req.body[EntityNameKey];

    setExtraData(req.session, {
      ...getApplicationData(req.session),
      [EntityNameKey]: entityName
    });

    let nextPageUrl = config.PRESENTER_URL;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      const appData: ApplicationData = getApplicationData(session);
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID, true);
        setExtraData(session, appData);
      } else {
        await updateOverseasEntity(req, session);
      }
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        nextPageUrl = getUrlWithTransactionIdAndSubmissionId(config.PRESENTER_WITH_PARAMS_URL, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
      }
    }
    return res.redirect(nextPageUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
