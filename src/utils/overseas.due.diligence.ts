import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { isRegistrationJourney } from "./url";
import { isActiveFeature } from "./feature.flag";
import { saveAndContinue } from "./save.and.continue";
import { DueDiligenceKey } from "../model/due.diligence.model";
import { updateOverseasEntity } from "../service/overseas.entities.service";

import { IdentityAddressKey, IdentityAddressKeys } from "../model/address.model";
import { AddressKeys, InputDateKeys } from "../model/data.types.model";
import { IdentityDateKey, IdentityDateKeys } from "../model/date.model";

import {
  OverseasEntityDueDiligenceKey,
  OverseasEntityDueDiligenceKeys
} from "../model/overseas.entity.due.diligence.model";

import {
  setApplicationData,
  prepareData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  fetchApplicationData,
  setExtraData,
} from "../utils/application.data";

export const getDueDiligence = async (
  req: Request,
  res: Response,
  next: NextFunction,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    const data = appData[OverseasEntityDueDiligenceKey];
    const identityAddress = (data?.[IdentityAddressKey]) ? mapDataObjectToFields(data[IdentityAddressKey], IdentityAddressKeys, AddressKeys) : {};
    const identityDate = (data?.[IdentityDateKey]) ? mapDataObjectToFields(data[IdentityDateKey], IdentityDateKeys, InputDateKeys) : {};

    return res.render(templateName, {
      backLinkUrl,
      templateName,
      ...data,
      ...identityAddress,
      [IdentityDateKey]: identityDate
    });

  } catch (error) {
    next(error);
  }
};

export const postDueDiligence = async (req: Request, res: Response, next: NextFunction, redirectUrl: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const session = req.session as Session;
    const data = prepareData(req.body, OverseasEntityDueDiligenceKeys);
    data[IdentityAddressKey] = mapFieldsToDataObject(req.body, IdentityAddressKeys, AddressKeys);
    data[IdentityDateKey] = mapFieldsToDataObject(req.body, IdentityDateKeys, InputDateKeys);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      let appData: ApplicationData = await fetchApplicationData(req, isRegistration);
      appData = Object.assign(appData, { [OverseasEntityDueDiligenceKey]: data });
      appData = Object.assign(appData, { [DueDiligenceKey]: {} }); // set dueDiligence object to empty
      await updateOverseasEntity(req, session, appData);
      setExtraData(session, appData);
    } else {
      await setApplicationData(session, data, OverseasEntityDueDiligenceKey);
      await setApplicationData(session, {}, DueDiligenceKey); // set dueDiligence object to empty
      await saveAndContinue(req, session);
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    next(error);
  }
};
