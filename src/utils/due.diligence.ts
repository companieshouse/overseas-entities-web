import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { saveAndContinue } from "../utils/save.and.continue";
import { isActiveFeature } from "./feature.flag";
import { updateOverseasEntity } from "../service/overseas.entities.service";

import { AddressKeys, InputDateKeys } from "../model/data.types.model";
import { OverseasEntityDueDiligenceKey } from "../model/overseas.entity.due.diligence.model";
import { DueDiligenceKey, DueDiligenceKeys } from "../model/due.diligence.model";
import { IdentityDateKey, IdentityDateKeys } from "../model/date.model";
import { IdentityAddressKey, IdentityAddressKeys } from "../model/address.model";

import {
  prepareData,
  setExtraData,
  setApplicationData,
  getApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
} from "../utils/application.data";

export const getDueDiligencePage = async (
  req: Request,
  res: Response,
  next: NextFunction,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req);
    const agentData = appData[DueDiligenceKey];
    const identityAddress = (agentData?.[IdentityAddressKey]) ? mapDataObjectToFields(agentData[IdentityAddressKey], IdentityAddressKeys, AddressKeys) : {};
    const identityDate = (agentData?.[IdentityDateKey]) ? mapDataObjectToFields(agentData[IdentityDateKey], IdentityDateKeys, InputDateKeys) : {};

    return res.render(templateName, {
      ...agentData,
      ...identityAddress,
      backLinkUrl,
      templateName,
      [IdentityDateKey]: identityDate,
    });

  } catch (error) {
    next(error);
  }
};

export const postDueDiligencePage = async (req: Request, res: Response, next: NextFunction, redirectUrl: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const agentData = prepareData(req.body, DueDiligenceKeys);
    agentData[IdentityAddressKey] = mapFieldsToDataObject(req.body, IdentityAddressKeys, AddressKeys);
    agentData[IdentityDateKey] = mapFieldsToDataObject(req.body, IdentityDateKeys, InputDateKeys);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      let appData: ApplicationData = await getApplicationData(req);
      appData = Object.assign(appData, { [DueDiligenceKey]: agentData });
      appData = Object.assign(appData, { [OverseasEntityDueDiligenceKey]: {} }); // set overseasEntityDueDiligence object to empty
      await updateOverseasEntity(req, session, appData);
      setExtraData(session, appData);
    } else {
      await setApplicationData(session, agentData, DueDiligenceKey);
      await setApplicationData(session, {}, OverseasEntityDueDiligenceKey); // set overseasEntityDueDiligence object to empty
      await saveAndContinue(req, session);
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    next(error);
  }
};
