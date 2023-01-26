import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import {
  WHO_IS_MAKING_UPDATE_PAGE,
  UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
  OVERSEAS_ENTITY_REVIEW_PAGE,
  UPDATE_DUE_DILIGENCE_URL
} from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { WhoIsRegisteringKey,  WhoIsRegisteringType } from "../../model/who.is.making.filing.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(WHO_IS_MAKING_UPDATE_PAGE, {
      backLinkUrl: UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: WHO_IS_MAKING_UPDATE_PAGE,
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
      return res.redirect(UPDATE_DUE_DILIGENCE_URL);
    } else {
      // TO DO: actual re-direct to be implemented for UAR-104
      return res.redirect(OVERSEAS_ENTITY_REVIEW_PAGE);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
