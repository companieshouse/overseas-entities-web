import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { IsSecureRegisterKey } from "../model/data.types.model";
import { getApplicationData, setExtraData } from "./application.data";
import { logger } from "./logger";
import { isRemoveJourney } from "../utils/url";
import * as config from "../config";

export const getFilterPage = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    if (isRemoveJourney(req)){
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

export const postFilterPage = (req: Request, res: Response, next: NextFunction, isSecureRegisterYes: string, isSecureRegisterNo: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isSecureRegister = req.body[IsSecureRegisterKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [IsSecureRegisterKey]: isSecureRegister });

    let nextPageUrl: any;
    if (isSecureRegister === '1') {
      nextPageUrl = isSecureRegisterYes;
    } else if (isSecureRegister === '0') {
      nextPageUrl = isSecureRegisterNo;
    }
    if (isRemoveJourney(req)){
      nextPageUrl = `${nextPageUrl}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
    }
    return res.redirect(nextPageUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
