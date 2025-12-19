import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { logger } from "./logger";
import * as config from "../config";
import { isActiveFeature } from "./feature.flag";
import { Session } from "@companieshouse/node-session-handler";
import { postTransaction } from "../service/transaction.service";

import { fetchApplicationData, setExtraData } from "./application.data";
import { createOverseasEntity, updateOverseasEntity } from "../service/overseas.entities.service";
import { IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";

import {
  getUrlWithTransactionIdAndSubmissionId,
  isRemoveJourney,
  isUpdateJourney
} from "../utils/url";

export const getFilterPage = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRemove = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);

    if (isRemove) {
      return res.render(templateName, {
        templateName,
        journey: config.JourneyType.remove,
        backLinkUrl: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL,
        [IsSecureRegisterKey]: appData[IsSecureRegisterKey]
      });
    }

    return res.render(templateName, {
      backLinkUrl,
      templateName,
      [IsSecureRegisterKey]: appData[IsSecureRegisterKey]
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postFilterPage = async (
  req: Request,
  res: Response,
  next: NextFunction,
  isSecureRegisterYesUrl: string,
  isSecureRegisterNoUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRedisRemovalFlag = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL);
    const isUpdate: boolean = await isUpdateJourney(req);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isUpdate);
    const isSecureRegister = (req.body[IsSecureRegisterKey]).toString();
    appData[IsSecureRegisterKey] = isSecureRegister;

    let nextPageUrl: string = "";

    if (isSecureRegister === "1") {
      nextPageUrl = isSecureRegisterYesUrl;
    }

    if (isSecureRegister === "0") {
      nextPageUrl = isSecureRegisterNoUrl;
      if (isRedisRemovalFlag && !isRemove) {
        await createOrUpdateEntityDetails(req, appData, isUpdate);
        nextPageUrl = getNextPageUrl(appData, isSecureRegisterNoUrl, isRemove, isRedisRemovalFlag);
      }
    }

    if (isRemove) {
      nextPageUrl = `${nextPageUrl}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
    }

    setExtraData(req.session, appData);
    return res.redirect(nextPageUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const createOrUpdateEntityDetails = async (req: Request, appData: ApplicationData, isUpdate: boolean): Promise<void> => {

  const session = req.session as Session;

  if (isUpdate && !appData[Transactionkey]) {
    const transactionID = await postTransaction(req, session);
    appData[Transactionkey] = transactionID;
    appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
  }

  if (appData[Transactionkey] && appData[OverseasEntityKey]) {
    await updateOverseasEntity(req, session, appData);
  } else {
    throw new Error("Error: is_secure_register filter cannot be updated - transaction_id or overseas_entity_id is missing");
  }
};

const getNextPageUrl = (appData: ApplicationData, fallbackUrl: string, isRemove: boolean, isRedisRemovalFlag: boolean): string => {
  try {
    if (isRedisRemovalFlag && !isRemove) {
      return getUrlWithTransactionIdAndSubmissionId(fallbackUrl, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
    }
    return fallbackUrl;
  } catch (error) {
    logger.error(`Error generating nextPageUrl with transactionId and submissionId: ${error}`);
    return fallbackUrl;
  }
};
