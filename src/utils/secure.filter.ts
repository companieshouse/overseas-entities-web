import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";
import { logger } from "./logger";
import { ApplicationData } from "../model";
import { isActiveFeature } from "./feature.flag";
import { postTransaction } from "../service/transaction.service";

import { getApplicationData, setExtraData } from "./application.data";
import { createOverseasEntity, updateOverseasEntity } from "../service/overseas.entities.service";
import { IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";

import {
  getRedirectUrl,
  isUpdateJourney,
  isRemoveJourney,
  getUrlWithTransactionIdAndSubmissionId,
} from "../utils/url";

export const getFilterPage = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove = await isRemoveJourney(req);
    const appData: ApplicationData = await getApplicationData(req);

    if (isRemove) {
      return res.render(templateName, {
        templateName,
        journey: config.JourneyType.remove,
        [IsSecureRegisterKey]: appData[IsSecureRegisterKey],
        backLinkUrl: getRedirectUrl({
          req,
          urlWithEntityIds: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_WITH_PARAMS_URL,
          urlWithoutEntityIds: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL,
        }),
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
    const appData: ApplicationData = await getApplicationData(req);
    const isSecureRegister = (req.body[IsSecureRegisterKey]).toString();
    appData[IsSecureRegisterKey] = isSecureRegister;

    let nextPageUrl: string = "";

    if (isSecureRegister === "1") {
      nextPageUrl = isSecureRegisterYesUrl;
    }

    if (isSecureRegister === "0") {
      nextPageUrl = isSecureRegisterNoUrl;
      if (isRedisRemovalFlag) {
        await createOrUpdateEntityDetails(req, appData, isUpdate, isRemove);
        nextPageUrl = getNextPageUrl(appData, isSecureRegisterNoUrl, isRedisRemovalFlag);
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

const createOrUpdateEntityDetails = async (req: Request, appData: ApplicationData, isUpdate: boolean, isRemove: boolean): Promise<void> => {

  const session = req.session as Session;

  if ((isUpdate || isRemove) && !appData[Transactionkey]) {
    const transactionID = await postTransaction(req, session);
    appData[Transactionkey] = transactionID;
    appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
  }

  if (appData[Transactionkey] && appData[OverseasEntityKey]) {
    await updateOverseasEntity(req, session, appData, true);
  } else {
    throw new Error("Error: is_secure_register filter cannot be updated - transaction_id or overseas_entity_id is missing");
  }
};

const getNextPageUrl = (appData: ApplicationData, fallbackUrl: string, isRedisRemovalFlag: boolean): string => {
  try {
    if (isRedisRemovalFlag) {
      return getUrlWithTransactionIdAndSubmissionId(fallbackUrl, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
    }
    return fallbackUrl;
  } catch (error) {
    logger.error(`Error generating nextPageUrl with transactionId and submissionId: ${error}`);
    return fallbackUrl;
  }
};
