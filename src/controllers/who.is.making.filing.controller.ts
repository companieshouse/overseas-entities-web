import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../model/who.is.making.filing.model";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.WHO_IS_MAKING_FILING_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    let backLinkUrl = config.PRESENTER_URL;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      backLinkUrl = getUrlWithParamsToPath(config.PRESENTER_PARAMS_URL, req);
    }

    return res.render(config.WHO_IS_MAKING_FILING_PAGE, {
      backLinkUrl,
      templateName: config.WHO_IS_MAKING_FILING_PAGE,
      [WhoIsRegisteringKey]: appData[WhoIsRegisteringKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.WHO_IS_MAKING_FILING_PAGE}`);
    const whoIsRegistering = req.body[WhoIsRegisteringKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [WhoIsRegisteringKey]: whoIsRegistering });

    if ( whoIsRegistering === WhoIsRegisteringType.AGENT ){
      return res.redirect(config.DUE_DILIGENCE_URL);
    } else {
      return res.redirect(config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
