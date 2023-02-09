import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { IsSecureRegisterKey } from "../model/data.types.model";
import { getApplicationData, setExtraData } from "./application.data";
import { logger } from "./logger";

export const getFilterPage = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

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

    if (isSecureRegister === '1') {
      return res.redirect(isSecureRegisterYes);
    } else if (isSecureRegister === '0') {
      return res.redirect(isSecureRegisterNo);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
