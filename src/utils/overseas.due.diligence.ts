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
import { DueDiligenceKey } from "../model/due.diligence.model";
import { IdentityAddressKey, IdentityAddressKeys } from "../model/address.model";
import { AddressKeys, InputDateKeys } from "../model/data.types.model";
import { IdentityDateKey, IdentityDateKeys } from "../model/date.model";
import { OverseasEntityDueDiligenceKey, OverseasEntityDueDiligenceKeys } from "../model/overseas.entity.due.diligence.model";
import { saveAndContinue } from "./save.and.continue";

export const getDueDiligence = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const data = appData[OverseasEntityDueDiligenceKey];

    const identityAddress = (data?.[IdentityAddressKey]) ? mapDataObjectToFields(data[IdentityAddressKey], IdentityAddressKeys, AddressKeys) : {};
    const identityDate = (data?.[IdentityDateKey]) ? mapDataObjectToFields(data[IdentityDateKey], IdentityDateKeys, InputDateKeys) : {};

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
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

    const session = req.session as Session;
    const data = prepareData(req.body, OverseasEntityDueDiligenceKeys);
    data[IdentityAddressKey] = mapFieldsToDataObject(req.body, IdentityAddressKeys, AddressKeys);
    data[IdentityDateKey] = mapFieldsToDataObject(req.body, IdentityDateKeys, InputDateKeys);

    setApplicationData(session, data, OverseasEntityDueDiligenceKey);

    // Empty DueDiligence object
    setApplicationData(session, {}, DueDiligenceKey);

    await saveAndContinue(req, session);

    return res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};
