import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationDataType, managingOfficerCorporateType } from "../model";
import { getFromApplicationData, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import { ManagingOfficerCorporateKey, ManagingOfficerCorporateKeys } from "../model/managing.officer.corporate.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    return res.render(config.MANAGING_OFFICER_CORPORATE_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      id: req.params.id,
      ...getFromApplicationData(req.session, ManagingOfficerCorporateKey, +req.params.id)
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    const data: ApplicationDataType = prepareOfficerData(req.body);
    setApplicationData(req.session, data, ManagingOfficerCorporateKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`UPDATE ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    removeFromApplicationData(req.session, ManagingOfficerCorporateKey, +req.params.id);

    const data: ApplicationDataType = prepareOfficerData(req.body);
    setApplicationData(req.session, data, ManagingOfficerCorporateKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`REMOVE ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    removeFromApplicationData(req.session, ManagingOfficerCorporateKey, +req.params.id);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const prepareOfficerData = (reqBody): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, ManagingOfficerCorporateKeys);
  data[managingOfficerCorporateType.UsualResidentialAddressKey] = prepareData(reqBody, managingOfficerCorporateType.UsualResidentialAddressKeys);
  data[managingOfficerCorporateType.ServiceAddressKey] = prepareData(reqBody, managingOfficerCorporateType.ServiceAddressKeys);
  data[managingOfficerCorporateType.DateKey] = prepareData(reqBody, managingOfficerCorporateType.DateKeys);

  return data;
};
