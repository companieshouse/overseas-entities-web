import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { IsListedAsPropertyOwnerKey } from "../../model/data.types.model";
import { getApplicationData, getRemove, setApplicationData } from "../../utils/application.data";
import { RemoveKey } from "../../model/remove.type.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    const remove = appData?.[RemoveKey];

    return res.render(config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: `${config.REMOVE_SOLD_ALL_LAND_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      templateName: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE,
      [IsListedAsPropertyOwnerKey]: remove?.[IsListedAsPropertyOwnerKey]
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);
    const isListedAsPropertyOwner = req.body[IsListedAsPropertyOwnerKey];

    const appData: ApplicationData = getApplicationData(req.session);
    const remove = getRemove(appData);
    remove[IsListedAsPropertyOwnerKey] = isListedAsPropertyOwner;

    setApplicationData(req.session, remove, RemoveKey);

    if (isListedAsPropertyOwner === config.OPTION_NO) {
      return res.redirect(`${config.SECURE_UPDATE_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    }
    return res.redirect(config.REMOVE_CANNOT_USE_URL);
  } catch (error) {
    next(error);
  }
};
