import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData, ApplicationDataType, managingOfficerCorporateType } from "../model";
import { getApplicationData, mapObjectFieldToAddress, prepareData, setApplicationData } from "../utils/application.data";
import { ManagingOfficerCorporateKey, ManagingOfficerCorporateKeys } from "../model/managing.officer.corporate.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.MANAGING_OFFICER_CORPORATE_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...appData.managingOfficerCorporate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {

  try {
    logger.debugRequest(req, `POST ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, ManagingOfficerCorporateKeys);
    data[managingOfficerCorporateType.UsualResidentialAddressKey] = mapObjectFieldToAddress(req.body, managingOfficerCorporateType.UsualResidentialAddressKeys);
    data[managingOfficerCorporateType.ServiceAddressKey] = mapObjectFieldToAddress(req.body, managingOfficerCorporateType.ServiceAddressKeys);
    data[managingOfficerCorporateType.DateKey] = prepareData(req.body, managingOfficerCorporateType.DateKeys);

    setApplicationData(req.session, data, ManagingOfficerCorporateKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
