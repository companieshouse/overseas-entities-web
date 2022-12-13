import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";
import { ApplicationData } from "../model";
import { PresenterKey, PresenterKeys } from "../model/presenter.model";
import { getApplicationData, setApplicationData, prepareData } from "../utils/application.data";
import { logger } from "../utils/logger";
import { saveAndContinue } from "../utils/save.and.continue";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET PRESENTER_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);
    const presenter = appData[PresenterKey];

    return res.render(config.PRESENTER_PAGE, {
      backLinkUrl: config.OVERSEAS_NAME_URL,
      templateName: config.PRESENTER_PAGE,
      ...presenter
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST PRESENTER_PAGE`);

    const session = req.session as Session;
    const data = prepareData(req.body, PresenterKeys);
    setApplicationData(session, data, PresenterKey);

    await saveAndContinue(req, session);

    return res.redirect(config.WHO_IS_MAKING_FILING_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
