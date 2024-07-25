import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";
import { Session } from "@companieshouse/node-session-handler";
import { DueDiligenceKey } from "../../model/due.diligence.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    return res.render(config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE, {
      templateName: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
      backLinkUrl: getBackLinkUrl(appData),
      ...appData
    });
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    return res.redirect(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

const getBackLinkUrl = (appData: ApplicationData) => {
  let backLinkUrl;

  const agentDueDiligence = appData[DueDiligenceKey] && Object.keys(appData[DueDiligenceKey]).length > 0;

  if (agentDueDiligence) {
    backLinkUrl = config.UPDATE_DUE_DILIGENCE_URL;
  } else {
    backLinkUrl = config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL;
  }

  return backLinkUrl;

};
