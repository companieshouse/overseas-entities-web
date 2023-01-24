import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../../config";
import { ApplicationData } from "../../model";
import { logger } from "../../utils/logger";
import {
  getApplicationData,
  setApplicationData,
  prepareData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
} from "../../utils/application.data";
import { DueDiligenceKey, DueDiligenceKeys } from "../../model/due.diligence.model";
import { OverseasEntityDueDiligenceKey } from "../../model/overseas.entity.due.diligence.model";
import { IdentityDateKey, IdentityDateKeys } from "../../model/date.model";
import { IdentityAddressKey, IdentityAddressKeys } from "../../model/address.model";
import { AddressKeys, InputDateKeys } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const data = appData[DueDiligenceKey];

    const identityAddress = (data?.[IdentityAddressKey]) ? mapDataObjectToFields(data[IdentityAddressKey], IdentityAddressKeys, AddressKeys) : {};
    const identityDate = (data?.[IdentityDateKey]) ? mapDataObjectToFields(data[IdentityDateKey], IdentityDateKeys, InputDateKeys) : {};

    return res.render(config.UPDATE_DUE_DILIGENCE_PAGE, {
      backLinkUrl: config.WHO_IS_MAKING_FILING_URL,
      templateName: config.UPDATE_DUE_DILIGENCE_PAGE,
      ...data,
      ...identityAddress,
      [IdentityDateKey]: identityDate
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const data = prepareData(req.body, DueDiligenceKeys);
    data[IdentityAddressKey] = mapFieldsToDataObject(req.body, IdentityAddressKeys, AddressKeys);
    data[IdentityDateKey] = mapFieldsToDataObject(req.body, IdentityDateKeys, InputDateKeys);

    setApplicationData(session, data, DueDiligenceKey);

    // Empty OverseasEntityDueDiligence object
    setApplicationData(session, {}, OverseasEntityDueDiligenceKey);

    return res.redirect(config.UPDATE_CHECK_YOUR_ANSWERS_PAGE);
  } catch (error) {
    next(error);
  }
};
