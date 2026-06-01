import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { RemoveKey } from "../../model/remove.type.model";
import { getRedirectUrl } from "../../utils/url";
import { isActiveFeature } from "../../utils/feature.flag";
import { ApplicationData } from "../../model";
import { IsListedAsPropertyOwnerKey } from "../../model/data.types.model";
import { saveDataToCookie, getDataFromEntityCookie } from "../../utils/update/data.cookie";
import { getApplicationData, getRemove, setApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);

    const isRedisRemovalFlag = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL);
    const appData: ApplicationData = await getAppData(req, isRedisRemovalFlag);
    const remove = appData?.[RemoveKey];

    return res.render(config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE, {
      journey: config.JourneyType.remove,
      templateName: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE,
      [IsListedAsPropertyOwnerKey]: remove?.[IsListedAsPropertyOwnerKey],
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.REMOVE_SOLD_ALL_LAND_FILTER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.REMOVE_SOLD_ALL_LAND_FILTER_URL,
      }) + config.JOURNEY_REMOVE_QUERY_PARAM,
    });

  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `POST ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);

    const isRedisRemovalFlag = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL);
    const isListedAsPropertyOwner = req.body[IsListedAsPropertyOwnerKey];
    const appData: ApplicationData = await getAppData(req, isRedisRemovalFlag);
    const remove = getRemove(appData);
    remove[IsListedAsPropertyOwnerKey] = isListedAsPropertyOwner;

    if (isRedisRemovalFlag) {
      saveDataToCookie(req, res, RemoveKey, remove);
    } else {
      await setApplicationData(req.session as Session, remove, RemoveKey);
    }

    if (isListedAsPropertyOwner === config.BUTTON_OPTION_NO) {
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: config.SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.SECURE_UPDATE_FILTER_URL,
      }) + config.JOURNEY_REMOVE_QUERY_PARAM);
    }

    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: config.REMOVE_CANNOT_USE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.REMOVE_CANNOT_USE_URL,
    }) + "?" + config.PREVIOUS_PAGE_QUERY_PARAM + "=" + config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE);

  } catch (error) {
    next(error);
  }
};

const getAppData = async (req: Request, isRedisRemovalFlag: boolean): Promise<ApplicationData> => {
  if (isRedisRemovalFlag) {
    return await getDataFromEntityCookie(req, false);
  }
  return await getApplicationData(req);
};
