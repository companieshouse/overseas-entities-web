import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getRedirectUrl } from "../../utils/url";
import { ApplicationData } from "model";
import { DueDiligenceKey } from "../../model/due.diligence.model";
import { getApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req);

    return res.render(config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE, {
      ...appData,
      backLinkUrl: getBackLinkUrl(req, appData),
      templateName: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
    });

  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const redirectUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.OVERSEAS_ENTITY_UPDATE_DETAILS_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
    });
    return res.redirect(redirectUrl);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

const getBackLinkUrl = (req: Request, appData: ApplicationData) => {
  let backLinkUrl;
  const agentDueDiligence = appData[DueDiligenceKey] && Object.keys(appData[DueDiligenceKey]).length > 0;

  if (agentDueDiligence) {
    backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_DUE_DILIGENCE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_DUE_DILIGENCE_URL,
    });
  } else {
    backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL,
    });
  }

  return backLinkUrl;

};
