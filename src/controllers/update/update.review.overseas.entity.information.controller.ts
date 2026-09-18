import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import { ApplicationData } from "model";
import { DueDiligenceKey } from "../../model/due.diligence.model";
import { getApplicationData } from "../../utils/application.data";

import {
  getRedirectUrl,
  isRemoveJourney,
  isUpdateJourney,
} from "../../utils/url";

import {
  JourneyType,
  UPDATE_DUE_DILIGENCE_URL,
  OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
  UPDATE_DUE_DILIGENCE_WITH_PARAMS_URL,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
  OVERSEAS_ENTITY_UPDATE_DETAILS_WITH_PARAMS_URL,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req);
    const isRemove: boolean = await isRemoveJourney(req);
    const isUpdate: boolean = await isUpdateJourney(req);

    return res.render(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE, {
      ...appData,
      backLinkUrl: getBackLinkUrl(req, appData),
      templateName: UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
      journey: isRemove ? JourneyType.remove : (isUpdate ? JourneyType.update : JourneyType.register),
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
      urlWithEntityIds: OVERSEAS_ENTITY_UPDATE_DETAILS_WITH_PARAMS_URL,
      urlWithoutEntityIds: OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
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
      urlWithEntityIds: UPDATE_DUE_DILIGENCE_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_DUE_DILIGENCE_URL,
    });
  } else {
    backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL,
    });
  }

  return backLinkUrl;

};
