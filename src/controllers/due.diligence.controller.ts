import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";
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
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.DUE_DILIGENCE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const data = appData[DueDiligenceKey];

    const identityAddress = (data?.[IdentityAddressKey]) ? mapDataObjectToFields(data[IdentityAddressKey], IdentityAddressKeys, AddressKeys) : {};
    const identityDate = (data?.[IdentityDateKey]) ? mapDataObjectToFields(data[IdentityDateKey], IdentityDateKeys, InputDateKeys) : {};

    let backLinkUrl = config.WHO_IS_MAKING_FILING_URL;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      backLinkUrl = getUrlWithParamsToPath(config.WHO_IS_MAKING_FILING_PARAMS_URL, req);
    }

    return res.render(config.DUE_DILIGENCE_PAGE, {
      backLinkUrl,
      templateName: config.DUE_DILIGENCE_PAGE,
      ...data,
      ...identityAddress,
      [IdentityDateKey]: identityDate
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.DUE_DILIGENCE_PAGE}`);

    const session = req.session as Session;
    const data = prepareData(req.body, DueDiligenceKeys);
    data[IdentityAddressKey] = mapFieldsToDataObject(req.body, IdentityAddressKeys, AddressKeys);
    data[IdentityDateKey] = mapFieldsToDataObject(req.body, IdentityDateKeys, InputDateKeys);

    setApplicationData(session, data, DueDiligenceKey);

    // Empty OverseasEntityDueDiligence object
    setApplicationData(session, {}, OverseasEntityDueDiligenceKey);

    await saveAndContinue(req, session);

    return res.redirect(config.ENTITY_URL);
  } catch (error) {
    next(error);
  }
};
