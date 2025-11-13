import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { logger } from "./logger";
import * as config from "../config";
import { isActiveFeature } from "./feature.flag";

import { Session } from "@companieshouse/node-session-handler";
import { postTransaction } from "../service/transaction.service";

import { IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { fetchApplicationData, getApplicationData, setExtraData } from "./application.data";
import { createOverseasEntity, updateOverseasEntity } from "../service/overseas.entities.service";

import {
  getUrlWithTransactionIdAndSubmissionId,
  isRemoveJourney,
  isRegistrationJourney,
  isUpdateJourney
} from "../utils/url";

export const getFilterPage = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    // const isRegistration = isRegistrationJourney(req);
    const isRemove = await isRemoveJourney(req);
    const appData: ApplicationData = await getApplicationData(req, true);

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

    const isRegistration: boolean = isRegistrationJourney(req);
    const isUpdate: boolean = await isUpdateJourney(req);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

    const isSecureRegister = (req.body[IsSecureRegisterKey]).toString();
    appData[IsSecureRegisterKey] = isSecureRegister;
    const session = req.session as Session;

    let nextPageUrl: string = "";

    if (isSecureRegister === "1") {
      nextPageUrl = isSecureRegisterYesUrl;
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
        nextPageUrl = getUrlWithTransactionIdAndSubmissionId(isSecureRegisterYesUrl, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
      }
    }

    if (isSecureRegister === "0") {

      nextPageUrl = isSecureRegisterNoUrl;

      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {

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

        nextPageUrl = getUrlWithTransactionIdAndSubmissionId(isSecureRegisterNoUrl, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);

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
