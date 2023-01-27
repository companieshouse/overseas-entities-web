import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";
import { ApplicationData } from "../model";
import { PresenterKey, PresenterKeys } from "../model/presenter.model";
import { getAppDataFromAPI, prepareData, updateApplicationData } from "../utils/application.data";
import { logger } from "../utils/logger";
import { updateOverseasEntityWithAppData } from "../service/overseas.entities.service";
import { isActiveFeature } from "../utils/feature.flag";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET PRESENTER_PAGE`);

    // current method of getting from session
    // const appData: ApplicationData = getApplicationData(req.session);

    // POC start - get data from API
    const appData: ApplicationData = await getAppDataFromAPI(req);
    // POC end

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
    const presenterData = prepareData(req.body, PresenterKeys);
    // setApplicationData(session, data, PresenterKey);
    let appData = await getAppDataFromAPI(req);

    console.log("----- BEFORE ---- " + JSON.stringify(appData, null, 2));
    appData = updateApplicationData(appData, presenterData, PresenterKey);
    console.log("----- AFTER ---- " + JSON.stringify(appData, null, 2));

    // await saveAndContinue(req, session);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      await updateOverseasEntityWithAppData(req, appData, session);
    }

    return res.redirect(config.WHO_IS_MAKING_FILING_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
