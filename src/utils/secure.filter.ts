import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { IsSecureRegisterKey } from "../model/data.types.model";
import { getApplicationData, setExtraData } from "./application.data";
import { logger } from "./logger";
import { isRemoveJourney } from "../utils/url";
import * as config from "../config";

export const getFilterPage = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req.session);

    if (await isRemoveJourney(req)) {
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
    const isSecureRegister = req.body[IsSecureRegisterKey];

    setExtraData(req.session, { ...(await getApplicationData(req.session)), [IsSecureRegisterKey]: isSecureRegister });

    let nextPageUrl: any;
    if (isSecureRegister === '1') {
      nextPageUrl = isSecureRegisterYes;
    } else if (isSecureRegister === '0') {
      nextPageUrl = isSecureRegisterNo;
    }
    if (await isRemoveJourney(req)) {
      nextPageUrl = `${nextPageUrl}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
    }
    return res.redirect(nextPageUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
