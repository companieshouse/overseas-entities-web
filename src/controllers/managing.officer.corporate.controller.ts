import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData, ApplicationDataType, managingOfficerCorportateType } from "../model";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";
import { ManagingOfficerCorporateKey, ManagingOfficerCorporateKeys } from "../model/managing.officer.corporate.model";
import { PRESENTER_URL } from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

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
    logger.debug(`POST ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, ManagingOfficerCorporateKeys);
    data[managingOfficerCorportateType.UsualResidentialAddressKey] = prepareData(req.body, managingOfficerCorportateType.UsualResidentialAddressKeys);
    data[managingOfficerCorportateType.ServiceAddressKey] = prepareData(req.body, managingOfficerCorportateType.ServiceAddressKeys);
    data[managingOfficerCorportateType.DateKey] = prepareData(req.body, managingOfficerCorportateType.DateKeys);

    setApplicationData(req.session, data, ManagingOfficerCorporateKey);

    return res.redirect(PRESENTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
