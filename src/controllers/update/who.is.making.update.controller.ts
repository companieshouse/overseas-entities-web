import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../model/who.is.making.filing.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.WHO_IS_MAKING_UPDATE_PAGE, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.WHO_IS_MAKING_UPDATE_PAGE,
      [WhoIsRegisteringKey]: appData[WhoIsRegisteringKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const whoIsUpdating = req.body[WhoIsRegisteringKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [WhoIsRegisteringKey]: whoIsUpdating });

    if ( whoIsUpdating === WhoIsRegisteringType.AGENT ){
      return res.redirect(config.OVERSEAS_ENTITY_REVIEW_PAGE); // TO DO: update to UAR-101
    } else {
      return res.redirect(config.OVERSEAS_ENTITY_REVIEW_PAGE); // TO DO: update to UAR-102
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
