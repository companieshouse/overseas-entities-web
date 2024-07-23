import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { getApplicationData, setExtraData } from "./application.data";
import { logger } from "./logger";
import { getUrlWithTransactionIdAndSubmissionId, isRemoveJourney } from "../utils/url";
import * as config from "../config";
import { isActiveFeature } from "./feature.flag";
import { updateOverseasEntity } from "../service/overseas.entities.service";

export const getFilterPage = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    if (isRemoveJourney(req)) {
      return res.render(templateName, {
        journey: config.JourneyType.remove,
        backLinkUrl: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL,
        templateName: templateName,
        [IsSecureRegisterKey]: appData[IsSecureRegisterKey]
      });
    }
    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      [IsSecureRegisterKey]: appData[IsSecureRegisterKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postFilterPage = async (req: Request, res: Response, next: NextFunction, isSecureRegisterYes: string, isSecureRegisterNo: string): Promise<void> => {
  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const isSecureRegister = (req.body[IsSecureRegisterKey]).toString();
    appData[IsSecureRegisterKey] = isSecureRegister;

    let nextPageUrl: string = "";

    if (isSecureRegister === "1") {
      return res.redirect(isSecureRegisterYes);
    }
    if (isSecureRegister === "0") {
      nextPageUrl = isSecureRegisterNo;
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        if (appData[Transactionkey] && appData[OverseasEntityKey]) {
          await updateOverseasEntity(req, req.session, appData);
        } else {
          throw new Error("Invalid request");
        }
        nextPageUrl = getUrlWithTransactionIdAndSubmissionId(isSecureRegisterNo, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
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
