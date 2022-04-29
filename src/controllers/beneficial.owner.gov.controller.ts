import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, beneficialOwnerGovType } from "../model";
import { getApplicationData, mapObjectFieldToAddress, prepareData, setApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_GOV_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_GOV_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...appData.beneficial_owners_government_or_public_authority
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_GOV_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, beneficialOwnerGovType.BeneficialOwnerGovKeys);
    data[beneficialOwnerGovType.PrincipalAddressKey] = mapObjectFieldToAddress(req.body, beneficialOwnerGovType.PrincipalAddressKeys);
    data[beneficialOwnerGovType.ServiceAddressKey] = mapObjectFieldToAddress(req.body, beneficialOwnerGovType.ServiceAddressKeys);
    data[beneficialOwnerGovType.StartDateKey] = prepareData(req.body, beneficialOwnerGovType.StartDateKeys);
    setApplicationData(req.session, data, beneficialOwnerGovType.BeneficialOwnerGovKey);
    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
