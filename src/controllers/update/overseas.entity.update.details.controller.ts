import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { saveAndContinue } from "../../utils/save.and.continue";
import { isActiveFeature } from "../../utils/feature.flag";
import { mapRequestToEntityData } from "../../utils/request.to.entity.mapper";
import { updateOverseasEntity } from "../../service/overseas.entities.service";
import { fetchOverseasEntityEmailAddress } from "../../utils/update/fetch.overseas.entity.email";
import { fetchBeneficialOwnersPrivateData } from "../../utils/update/fetch.beneficial.owners.private.data";
import { fetchManagingOfficersPrivateData } from "../../utils/update/fetch.managing.officers.private.data";

import { Entity, EntityKey } from "../../model/entity.model";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { AddressKeys, EntityNameKey } from "../../model/data.types.model";
import { ApplicationData, ApplicationDataType } from "../../model";

import {
  setExtraData,
  setApplicationData,
  fetchApplicationData,
  mapDataObjectToFields,
} from "../../utils/application.data";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  PrincipalAddressKey,
  PrincipalAddressKeys,
} from "../../model/address.model";

let isRemove: boolean = false;

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const session = req.session as Session;
    isRemove = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    await fetchBeneficialOwnersPrivateData(appData, req);
    await fetchManagingOfficersPrivateData(appData, req);
    await fetchOverseasEntityEmailAddress(appData, req, session);
    const entity = appData[EntityKey];

    const principalAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys)
      : {};
    const serviceAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[ServiceAddressKey], ServiceAddressKeys, AddressKeys)
      : {};

    return res.render(config.ENTITY_PAGE, {
      ...entity,
      ...principalAddress,
      ...serviceAddress,
      ...appData,
      templateName: config.ENTITY_PAGE,
      entityName: appData?.[EntityNameKey],
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
      }),
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    isRemove = await isRemoveJourney(req);
    const data: ApplicationDataType = mapRequestToEntityData(req);
    const session = req.session as Session;
    const entityName = req.body[EntityNameKey];
    await setOriginalIncorporationCountry(req, session, data);
    await setApplicationData(req, data, EntityKey);

    let appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    appData = { ...appData, [EntityNameKey]: entityName };

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
      await updateOverseasEntity(req, session, appData);
    } else {
      await saveAndContinue(req, session);
    }
    setExtraData(req.session, appData);

    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    }));

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

// The original incorporation country is set again here in case it's been overwritten with an incorrect value (it's the only read-only field on the screen and may be replaced with another value by browser auto-fill functionality)
const setOriginalIncorporationCountry = async (req: Request, session: Session, data: ApplicationDataType) => {
  const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
  const entity = appData[EntityKey];
  (data as Entity).incorporation_country = entity?.incorporation_country;
};

