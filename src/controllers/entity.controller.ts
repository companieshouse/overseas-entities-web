import { NextFunction, Request, Response } from "express";
import { EntityKey } from "../model/entity.model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { mapRequestToEntityData } from "../utils/request.to.entity.mapper";
import { getEntityBackLink } from "../utils/navigation";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

import {
  ApplicationData,
  ApplicationDataType
} from "../model";

import {
  AddressKeys,
  EntityNameKey
} from "../model/data.types.model";

import {
  PrincipalAddressKey,
  PrincipalAddressKeys,
  ServiceAddressKey,
  ServiceAddressKeys
} from "../model/address.model";

import {
  getApplicationData,
  setApplicationData,
  mapDataObjectToFields
} from "../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ENTITY_PAGE`);

    const appData: ApplicationData = await getApplicationData(req);
    const entity = appData[EntityKey];
    const principalAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys)
      : {};
    const serviceAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[ServiceAddressKey], ServiceAddressKeys, AddressKeys)
      : {};

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: getEntityBackLink(appData, req),
      templateName: config.ENTITY_PAGE,
      entityName: appData[EntityNameKey],
      ...entity,
      ...principalAddress,
      ...serviceAddress
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
