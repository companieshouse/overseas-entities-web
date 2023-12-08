import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationData } from "../model";
import { PresenterKey, PresenterKeys } from "../model/presenter.model";
import { getApplicationData, prepareData, setApplicationData } from "./application.data";
import { logger } from "./logger";
import { saveAndContinue } from "./save.and.continue";
import { isRemoveJourney } from "../utils/url";
import * as config from "../config";

export const getPresenterPage = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const presenter = appData[PresenterKey];

    if (isRemoveJourney(req)){
      return res.render(config.UPDATE_PRESENTER_PAGE, {
        journey: config.JourneyType.remove,
        backLinkUrl: `${config.UPDATE_FILING_DATE_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
        templateName: config.UPDATE_PRESENTER_PAGE
      });
    }

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      ...presenter
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
