import { NextFunction, Request, Response } from "express";

import {
  setApplicationData,
  getApplicationData,
  mapDataObjectToFields,
  setExtraData
} from "../../utils/application.data";
import { Entity, EntityKey } from "../../model/entity.model";
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
import { saveAndContinue } from "../../utils/save.and.continue";
import { isActiveFeature } from "../../utils/feature.flag";
import { fetchOverseasEntityEmailAddress } from "../../utils/update/fetch.overseas.entity.email";
import { fetchBeneficialOwnersPrivateData } from "../../utils/update/fetch.beneficial.owners.private.data";
import { fetchManagingOfficersPrivateData } from "../../utils/update/fetch.managing.officers.private.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const session = req.session as Session;

    const appData: ApplicationData = getApplicationData(session);

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
      backLinkUrl: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
      templateName: config.ENTITY_PAGE,
      entityName: appData?.[EntityNameKey],
      ...entity,
      ...principalAddress,
      ...serviceAddress,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const data: ApplicationDataType = mapRequestToEntityData(req);
    const session = req.session as Session;
    const entityName = req.body[EntityNameKey];

    setOriginalIncorporationCountry(session, data);

    setApplicationData(session, data, EntityKey);

    setExtraData(req.session, {
      ...getApplicationData(req.session),
      [EntityNameKey]: entityName
    });

    await saveAndContinue(req, session, false);
    const redirectUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION)
      ? config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL
      : config.BENEFICIAL_OWNER_STATEMENTS_PAGE;
    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

// The original incorporation country is set again here in case it's been overwritten with an incorrect value (it's the only read-only field on the screen and may be replaced with another value by browser auto-fill functionality)
const setOriginalIncorporationCountry = (session: Session, data: ApplicationDataType) => {
  const appData: ApplicationData = getApplicationData(session);
  const entity = appData[EntityKey];
  (data as Entity).incorporation_country = entity?.incorporation_country;
};

