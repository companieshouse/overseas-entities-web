import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationData } from "../model";
import { PresenterKey, PresenterKeys } from "../model/presenter.model";
import { getApplicationData, prepareData, setApplicationData } from "./application.data";
import { logger } from "./logger";
import { saveAndContinue } from "./save.and.continue";

export const getPresenterPage = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string, registrationFlag: boolean): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const presenter = appData[PresenterKey];

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      ...presenter,
      isSaveAndContinue: registrationFlag === false ? true : undefined
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postPresenterPage = async (req: Request, res: Response, next: NextFunction, redirectUrl: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const data = prepareData(req.body, PresenterKeys);
    setApplicationData(session, data, PresenterKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
