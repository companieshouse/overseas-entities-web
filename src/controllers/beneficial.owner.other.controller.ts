import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData, ApplicationDataType, entityType, otherOwnerType } from "../model";
import {getApplicationData, prepareData, setApplicationData} from "../utils/application.data";
import {  OtherBeneficialOwnerKey, OtherBeneficialOwnerKeys } from "../model/beneficial-owner/other.model";


export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET BENEFICIAL_OWNER_OTHER_PAGE`);

    res.render(config.BENEFICIAL_OWNER_OTHER_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`POST BENEFICIAL_OWNER_OTHER_PAGE`);

  try {
    const data: ApplicationDataType = prepareData(req.body, OtherBeneficialOwnerKeys);
    data[entityType.PrincipalAddressKey] = prepareData(req.body, entityType.PrincipalAddressKeys);
    data[entityType.ServiceAddressKey] = prepareData(req.body, entityType.ServiceAddressKeys);
    data[otherOwnerType.DateKey] = prepareData(req.body, otherOwnerType.DateKeys);
    setApplicationData(req.session, data, OtherBeneficialOwnerKey);

    const appData: ApplicationData = getApplicationData(req.session);
    logger.debug("SESSION GET " + JSON.stringify(appData));

    res.redirect(config.MANAGING_OFFICER_URL);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

