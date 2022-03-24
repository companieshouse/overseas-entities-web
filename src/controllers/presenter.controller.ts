import { Request, Response } from "express";

import { getApplicationData, setApplicationData, prepareData } from "../utils/application.data";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, PresenterKeys, PresenterKey } from "../model";

export const get = (req: Request, res: Response) => {
  logger.info(`GET PRESENTER_PAGE`);

  const appData: ApplicationData = getApplicationData(req.session);

  return res.render(config.PRESENTER_PAGE, {
    backLinkUrl: config.LANDING_URL,
    ...appData.presenter
  });
};

export const post = (req: Request, res: Response) => {
  logger.info(`POST PRESENTER_PAGE`);

  setApplicationData(req.session, prepareData(req.body, PresenterKeys), PresenterKey);

  return res.render(config.ENTITY_PAGE, {
    backLinkUrl: config.PRESENTER_URL
  });
};
