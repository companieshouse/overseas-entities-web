import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { ApplicationData } from "../model";
import { logger } from "../utils/logger";
import { isActiveFeature } from "../utils/feature.flag";
import { postTransaction } from "../service/transaction.service";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { createOverseasEntity, updateOverseasEntity } from "../service/overseas.entities.service";

import {
  EntityNameKey,
  Transactionkey,
  OverseasEntityKey,
} from "../model/data.types.model";

import {
  getUrlWithParamsToPath,
  getUrlWithTransactionIdAndSubmissionId,
  transactionIdAndSubmissionIdExistInRequest
} from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.OVERSEAS_NAME_PAGE}`);

    const appData: ApplicationData = await getApplicationData(req);
    let backLinkUrl = config.INTERRUPT_CARD_URL;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && transactionIdAndSubmissionIdExistInRequest(req)) {
      backLinkUrl = getUrlWithParamsToPath(config.INTERRUPT_CARD_WITH_PARAMS_URL, req);
    }

    return res.render(config.OVERSEAS_NAME_PAGE, {
      backLinkUrl,
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

    const data: ApplicationData = await getApplicationData(req);
    const appData: ApplicationData = { ...data, [EntityNameKey]: req.body[EntityNameKey] };
    const session = req.session as Session;

    let nextPageUrl = config.PRESENTER_URL;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      await updateOverseasEntity(req, session, appData);
      nextPageUrl = getUrlWithTransactionIdAndSubmissionId(
        config.PRESENTER_WITH_PARAMS_URL,
        appData[Transactionkey] as string,
        appData[OverseasEntityKey] as string
      );
    } else {
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
      } else {
        await updateOverseasEntity(req, session);
      }
    }

    setExtraData(req.session, appData);
    return res.redirect(nextPageUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
