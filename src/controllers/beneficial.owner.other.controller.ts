import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData, ApplicationDataType, entityType, beneficialOwnerOtherType } from "../model";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";
import {  BeneficialOwnerOtherKey, BeneficialOwnerOtherKeys } from "../model/other.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.BENEFICIAL_OWNER_OTHER_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_OTHER_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE,
      ...appData.beneficialOwnerOther
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {

  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_OTHER_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, BeneficialOwnerOtherKeys);
    data[entityType.PrincipalAddressKey] = prepareData(req.body, entityType.PrincipalAddressKeys);
    data[entityType.ServiceAddressKey] = prepareData(req.body, entityType.ServiceAddressKeys);
    data[beneficialOwnerOtherType.DateKey] = prepareData(req.body, beneficialOwnerOtherType.DateKeys);

    setApplicationData(req.session, data, BeneficialOwnerOtherKey);

    return res.redirect(config.MANAGING_OFFICER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

