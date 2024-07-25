import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { getApplicationData, setExtraData } from "./application.data";
import { logger } from "./logger";
import { getUrlWithTransactionIdAndSubmissionId, isRemoveJourney } from "../utils/url";
import * as config from "../config";
import { isActiveFeature } from "./feature.flag";
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { Session } from "@companieshouse/node-session-handler";

export const getFilterPage = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    if (isRemoveJourney(req)) {
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

export const postFilterPage = async (req: Request, res: Response, next: NextFunction, isSecureRegisterYesUrl: string, isSecureRegisterNoUrl: string): Promise<void> => {
  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const isSecureRegister = (req.body[IsSecureRegisterKey]).toString();
    appData[IsSecureRegisterKey] = isSecureRegister;
    const session = req.session as Session;

    let nextPageUrl: string = "";

    if (isSecureRegister === "1") {
      nextPageUrl = isSecureRegisterYesUrl;
    }
    if (isSecureRegister === "0") {
      nextPageUrl = isSecureRegisterNoUrl;
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        if (appData[Transactionkey] && appData[OverseasEntityKey]) {
          await updateOverseasEntity(req, session, appData);
        } else {
          throw new Error("Error: is_secure_register filter cannot be updated - transaction_id or overseas_entity_id is missing");
        }
        nextPageUrl = getUrlWithTransactionIdAndSubmissionId(isSecureRegisterNoUrl, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
      }
    }
    if (isRemoveJourney(req)) {
      nextPageUrl = `${nextPageUrl}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
    }
    setExtraData(req.session, appData);
    return res.redirect(nextPageUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
