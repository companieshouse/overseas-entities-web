import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";
import { Session } from "@companieshouse/node-session-handler";
import { DueDiligenceKey } from "../../model/due.diligence.model";
import { OverseasEntityDueDiligenceKey } from "../../model/overseas.entity.due.diligence.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    let backLinkUrl;

    if (appData[DueDiligenceKey] && Object.keys(appData[DueDiligenceKey]).length > 0) {
      backLinkUrl = config.UPDATE_DUE_DILIGENCE_URL;
    } else if (appData[OverseasEntityDueDiligenceKey] && Object.keys(appData[OverseasEntityDueDiligenceKey]).length > 0) {
      backLinkUrl = config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL;
    } else {
      backLinkUrl = config.WHO_IS_MAKING_UPDATE_URL;
    }

    console.log(appData);

    return res.render(config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE, {
      templateName: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
      backLinkUrl,
      appData
    });
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    return res.redirect(config.OVERSEAS_ENTITY_REVIEW_PAGE);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
