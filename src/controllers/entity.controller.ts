import { Request, Response } from "express";

import { getApplicationData, setApplicationData, prepareData } from "../utils/application.data";
import { ApplicationData, EntityKey, EntityKeys } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.info(`GET ENTITY_PAGE`);

  const appData: ApplicationData = getApplicationData(req.session);

  return res.render(config.ENTITY_PAGE, {
    backLinkUrl: config.PRESENTER_URL,
    ...appData.entity
  });
};

export const post = (req: Request, res: Response) => {
  logger.info(`POST ENTITY_PAGE`);

  const data = prepareData(req.body, EntityKeys);
  setApplicationData(req.session, data, EntityKey);

  return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
    backLinkUrl: config.ENTITY_URL
  });
};
