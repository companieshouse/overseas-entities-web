import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { logger } from "./logger";
import { ApplicationData } from "../model";
import { isActiveFeature } from "./feature.flag";
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { getApplicationData, setExtraData } from "./application.data";
import { getDataFromEntityCookie, saveDataToCookie } from "./update/data.cookie";

import {
  Transactionkey,
  OverseasEntityKey,
  IsSecureRegisterKey,
} from "../model/data.types.model";

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
    const isUpdate: boolean = await isUpdateJourney(req);
    const appData: ApplicationData = await getAppData(req, isUpdate, isRemove);

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
    const appData: ApplicationData = await getAppData(req, isUpdate, isRemove);
    const isSecureRegister = (req.body[IsSecureRegisterKey]).toString();
    appData[IsSecureRegisterKey] = isSecureRegister;

    let nextPageUrl: string = "";

    if (isSecureRegister === "1") {
      nextPageUrl = isSecureRegisterYesUrl;
    }

    if (isSecureRegister === "0") {
      nextPageUrl = isSecureRegisterNoUrl;
    }

    nextPageUrl = getNextPageUrl(req, appData, nextPageUrl, isSecureRegister, isRedisRemovalFlag);

    if (isRemove) {
      nextPageUrl += config.JOURNEY_REMOVE_QUERY_PARAM;
    }

    await updateEntityDetails(req, res, appData, isUpdate, isRemove, isSecureRegister, isRedisRemovalFlag);
    setExtraData(req.session as Session, appData);

    return res.redirect(nextPageUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const updateEntityDetails = async (
  req: Request,
  res: Response,
  appData: ApplicationData,
  isUpdate: boolean,
  isRemove: boolean,
  isSecureRegister: string,
  isRedisRemovalFlag: boolean
): Promise<void> => {

  if (isRedisRemovalFlag) {
    const session = req.session as Session;
    if (isUpdate || isRemove) {
      saveDataToCookie(req, res, IsSecureRegisterKey, isSecureRegister);
    } else {
      if (appData[Transactionkey] && appData[OverseasEntityKey] && isSecureRegister === "0") {
        await updateOverseasEntity(req, session, appData, true);
      } else {
        logger.errorRequest(req, "Error: is_secure_register filter cannot be updated - transaction_id or overseas_entity_id is missing");
      }
    }
  }
};

const getNextPageUrl = (req, appData: ApplicationData, fallbackUrl: string, isSecureRegister: string, isRedisRemovalFlag: boolean): string => {

  try {

    if (!isRedisRemovalFlag) {
      return fallbackUrl;
    }

    if (appData[Transactionkey] && appData[OverseasEntityKey]) {
      return getUrlWithTransactionIdAndSubmissionId(fallbackUrl, appData[Transactionkey], appData[OverseasEntityKey]);
    }

    if (isSecureRegister === "0") {
      return getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_INTERRUPT_CARD_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_INTERRUPT_CARD_URL,
      });
    }

    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_USE_PAPER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_USE_PAPER_URL,
    });

  } catch (error) {
    logger.error(`Error generating nextPageUrl with transactionId and submissionId: ${error}`);
    return fallbackUrl;
  }
};

const getAppData = async (req: Request, isUpdate: boolean, isRemove: boolean): Promise<ApplicationData> => {
  let appData: ApplicationData = await getApplicationData(req);
  if (isUpdate || isRemove) {
    if (!Object.keys(appData).length) {
      appData = await getDataFromEntityCookie(req, false);
    }
  }
  return appData;
};
