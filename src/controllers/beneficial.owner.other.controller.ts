import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationDataType, entityType } from "../model";
import { prepareData, setApplicationData } from "../utils/application.data";
import {  OtherBeneficialOwnerKey, OtherBeneficialOwnerKeys } from "../model/beneficial-owner/owner.model";


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
    setApplicationData(req.session, data, OtherBeneficialOwnerKey);

    res.redirect(config.MANAGING_OFFICER_URL);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

