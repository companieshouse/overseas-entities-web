import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { OeNumberKey } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
      [OeNumberKey]: appData?.[OeNumberKey],
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);
    const oeNumber = req.body[OeNumberKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [OeNumberKey]: oeNumber });
    // return res.redirect(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
    return res.redirect(config.UPDATE_DUE_DILIGENCE_URL);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

