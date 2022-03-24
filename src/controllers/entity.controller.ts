import { NextFunction, Request, Response } from "express";

import { getApplicationData, setApplicationData, prepareData } from "../utils/application.data";
import { ApplicationData, Entity, EntityKey, EntityKeys } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`GET ENTITY_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: config.PRESENTER_URL,
      ...appData.entity
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`POST ENTITY_PAGE`);
    // const
    const data: Entity = prepareData(req.body, EntityKeys);
    // data.principalAddress = prepareData(req.body, PrincipalAddressKeys);
    setApplicationData(req.session, data, EntityKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_PAGE);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
