import { NextFunction, Request, Response } from "express";

import {
  setApplicationData,
  getApplicationData,
  mapDataObjectToFields,
  setExtraData
} from "../../utils/application.data";
import { EntityKey } from "../../model/entity.model";
import { ApplicationData, ApplicationDataType } from "../../model";
import {
  AddressKeys,
  EntityNameKey
} from "../../model/data.types.model";
import { logger } from "../../utils/logger";
import { mapRequestToEntityData } from "../../utils/request.to.entity.mapper";
import * as config from "../../config";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../../model/address.model";
import { Session } from "@companieshouse/node-session-handler";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {

    const appData: ApplicationData = getApplicationData(req.session);

    const entity = appData[EntityKey];
    const principalAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys)
      : {};
    const serviceAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[ServiceAddressKey], ServiceAddressKeys, AddressKeys)
      : {};

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_REVIEW_PAGE,
      templateName: config.ENTITY_PAGE,
      entityName: appData?.[EntityNameKey],
      ...entity,
      ...principalAddress,
      ...serviceAddress,
      pageParams: {
        isRegistration: false
      },
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const data: ApplicationDataType = mapRequestToEntityData(req);
    const session = req.session as Session;
    const entityName = req.body[EntityNameKey];

    setApplicationData(session, data, EntityKey);

    setExtraData(req.session, {
      ...getApplicationData(req.session),
      [EntityNameKey]: entityName
    });

    return res.redirect(config.OVERSEAS_ENTITY_REVIEW_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
