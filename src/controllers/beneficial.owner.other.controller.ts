import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData, ApplicationDataType, beneficialOwnerOtherType } from "../model";
import { getApplicationData, mapObjectFieldToAddress, prepareData, setApplicationData } from "../utils/application.data";
import {  BeneficialOwnerOtherKey, BeneficialOwnerOtherKeys } from "../model/beneficial.owner.other.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_OTHER_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_OTHER_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...appData.beneficial_owners_corporate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {

  try {
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_OTHER_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, BeneficialOwnerOtherKeys);
    data[beneficialOwnerOtherType.PrincipalAddressKey] = mapObjectFieldToAddress(req.body, beneficialOwnerOtherType.PrincipalAddressKeys);
    data[beneficialOwnerOtherType.ServiceAddressKey] = mapObjectFieldToAddress(req.body, beneficialOwnerOtherType.ServiceAddressKeys);
    data[beneficialOwnerOtherType.StartDateKey] = prepareData(req.body, beneficialOwnerOtherType.StartDateKeys);

    setApplicationData(req.session, data, BeneficialOwnerOtherKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

