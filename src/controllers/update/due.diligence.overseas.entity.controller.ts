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
import { OverseasEntityDueDiligenceKey, OverseasEntityDueDiligenceKeys } from "../../model/overseas.entity.due.diligence.model";
import { DueDiligenceKey } from "../../model/due.diligence.model";
import { IdentityDateKey, IdentityDateKeys } from "../../model/date.model";
import { IdentityAddressKey, IdentityAddressKeys } from "../../model/address.model";
import { AddressKeys, InputDateKeys } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const data = appData[OverseasEntityDueDiligenceKey];

    const identityAddress = (data?.[IdentityAddressKey]) ? mapDataObjectToFields(data[IdentityAddressKey], IdentityAddressKeys, AddressKeys) : {};
    const identityDate = (data?.[IdentityDateKey]) ? mapDataObjectToFields(data[IdentityDateKey], IdentityDateKeys, InputDateKeys) : {};

    return res.render(config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE, {
      backLinkUrl: config.WHO_IS_MAKING_UPDATE_URL,
      templateName: config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE,
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
    const data = prepareData(req.body, OverseasEntityDueDiligenceKeys);
    data[IdentityAddressKey] = mapFieldsToDataObject(req.body, IdentityAddressKeys, AddressKeys);
    data[IdentityDateKey] = mapFieldsToDataObject(req.body, IdentityDateKeys, InputDateKeys);

    setApplicationData(session, data, OverseasEntityDueDiligenceKey);

    // Empty DueDiligence object
    setApplicationData(session, {}, DueDiligenceKey);

    return res.redirect(config.OVERSEAS_ENTITY_REVIEW_URL);
  } catch (error) {
    next(error);
  }
};
