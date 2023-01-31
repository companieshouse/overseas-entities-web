import { NextFunction, Request, Response } from "express";

import { logger } from "./logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "./application.data";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../model/who.is.making.filing.model";

export const getWhoIsFilling = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      [WhoIsRegisteringKey]: appData[WhoIsRegisteringKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postWhoIsFilling = (req: Request, res: Response, next: NextFunction, registrationFlag: boolean) => {
  try {
    logger.debugRequest(req, `POST ${config.WHO_IS_MAKING_FILING_PAGE}`);
    const whoIsRegistering = req.body[WhoIsRegisteringKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [WhoIsRegisteringKey]: whoIsRegistering });

    filterJourneyType(res, registrationFlag, whoIsRegistering);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const filterJourneyType = (res: Response, registrationFlag: boolean, whoIsRegistering: string) => {
  if (registrationFlag) {
    return whoIsRegistering === WhoIsRegisteringType.AGENT ? res.redirect(config.DUE_DILIGENCE_URL) : res.redirect(config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
  } else {
    return res.redirect(config.OVERSEAS_ENTITY_REVIEW_PAGE);
  }
};
