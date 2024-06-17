import { NextFunction, Request, Response } from "express";

import { logger } from "./logger";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "./application.data";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../model/who.is.making.filing.model";

export const getWhoIsFiling = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(templateName, {
      backLinkUrl,
      templateName: templateName,
      [WhoIsRegisteringKey]: appData[WhoIsRegisteringKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postWhoIsFiling = (req: Request, res: Response, next: NextFunction, agentUrl: string, oeUrl: string) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const whoIsRegistering = req.body[WhoIsRegisteringKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [WhoIsRegisteringKey]: whoIsRegistering });

    if (whoIsRegistering === WhoIsRegisteringType.AGENT){
      return res.redirect(agentUrl);
    } else {
      return res.redirect(oeUrl);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
