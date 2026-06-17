import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { EntityKey } from "../model/entity.model";
import { mapRequestToEntityData } from "../utils/request.to.entity.mapper";
import { getEntityBackLink } from "../utils/navigation";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath, isRemoveJourney } from "../utils/url";

import { AddressKeys, EntityNameKey } from "../model/data.types.model";
import { ApplicationData, ApplicationDataType } from "../model";

import {
  setApplicationData,
  fetchApplicationData,
  mapDataObjectToFields,
} from "../utils/application.data";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  PrincipalAddressKey,
  PrincipalAddressKeys,
} from "../model/address.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ENTITY_PAGE`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const entity = appData[EntityKey];
    const principalAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys)
      : {};
    const serviceAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[ServiceAddressKey], ServiceAddressKeys, AddressKeys)
      : {};

    return res.render(config.ENTITY_PAGE, {
      ...entity,
      ...serviceAddress,
      ...principalAddress,
      entityName: appData[EntityNameKey],
      templateName: config.ENTITY_PAGE,
      backLinkUrl: getEntityBackLink(appData, req),
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `POST ENTITY_PAGE`);
    const data: ApplicationDataType = mapRequestToEntityData(req);
    await setApplicationData(req, data, EntityKey);
    let nextPageUrl = config.BENEFICIAL_OWNER_STATEMENTS_URL;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL, req);
    }

    return res.redirect(nextPageUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
