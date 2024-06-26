import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { ApplicationData } from "../model";
import { logger } from "../utils/logger";
import {
  getApplicationData,
  setApplicationData,
  prepareData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
} from "../utils/application.data";
import { DueDiligenceKey, DueDiligenceKeys } from "../model/due.diligence.model";
import { OverseasEntityDueDiligenceKey } from "../model/overseas.entity.due.diligence.model";
import { IdentityDateKey, IdentityDateKeys } from "../model/date.model";
import { IdentityAddressKey, IdentityAddressKeys } from "../model/address.model";
import { AddressKeys, InputDateKeys } from "../model/data.types.model";
import { saveAndContinue } from "../utils/save.and.continue";

export const getDueDiligencePage = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req.session);
    const agentData = appData[DueDiligenceKey];

    const identityAddress = (agentData?.[IdentityAddressKey]) ? mapDataObjectToFields(agentData[IdentityAddressKey], IdentityAddressKeys, AddressKeys) : {};
    const identityDate = (agentData?.[IdentityDateKey]) ? mapDataObjectToFields(agentData[IdentityDateKey], IdentityDateKeys, InputDateKeys) : {};

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      ...agentData,
      ...identityAddress,
      [IdentityDateKey]: identityDate
    });
  } catch (error) {
    next(error);
  }
};

export const postDueDiligencePage = async (req: Request, res: Response, next: NextFunction, redirectUrl: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const agentData = prepareData(req.body, DueDiligenceKeys);
    agentData[IdentityAddressKey] = mapFieldsToDataObject(req.body, IdentityAddressKeys, AddressKeys);
    agentData[IdentityDateKey] = mapFieldsToDataObject(req.body, IdentityDateKeys, InputDateKeys);

    await setApplicationData(session, agentData, DueDiligenceKey);

    // Empty OverseasEntityDueDiligence object
    await setApplicationData(session, {}, OverseasEntityDueDiligenceKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};
