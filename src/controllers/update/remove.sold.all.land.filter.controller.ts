import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { RemoveKey } from "../../model/remove.type.model";
import { getRedirectUrl } from "../../utils/url";
import { isActiveFeature } from "../../utils/feature.flag";
import { ApplicationData } from "../../model";
import { HasSoldAllLandKey } from "../../model/data.types.model";

import {
  saveDataToCookie,
  getDataFromEntityCookie,
} from "../../utils/update/data.cookie";

import {
  getRemove,
  setApplicationData,
} from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = await getDataFromEntityCookie(req, false);
    const remove = appData?.[RemoveKey];

    return res.render(config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE, {
      journey: config.JourneyType.remove,
      [HasSoldAllLandKey]: remove?.[HasSoldAllLandKey],
      templateName: config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE,
      backLinkUrl: `${config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
    });

  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `POST ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);

    const hasSoldAllLand = req.body[HasSoldAllLandKey];
    const appData: ApplicationData = await getDataFromEntityCookie(req, false);
    const remove = getRemove(appData);
    remove[HasSoldAllLandKey] = hasSoldAllLand;

    const nextPageUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL,
    }) + config.JOURNEY_REMOVE_QUERY_PARAM;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      saveDataToCookie(req, res, RemoveKey, remove);
    } else {
      await setApplicationData(req.session, remove, RemoveKey);
    }

    if (hasSoldAllLand === config.BUTTON_OPTION_YES) {
      return res.redirect(nextPageUrl);
    }

    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: config.REMOVE_CANNOT_USE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.REMOVE_CANNOT_USE_URL,
    }));

  } catch (error) {
    next(error);
  }
};
