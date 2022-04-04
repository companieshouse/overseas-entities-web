import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationDataType, managingOfficerType } from "../model";
import { getFromApplicationData, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.MANAGING_OFFICER_PAGE}`);

    return res.render(config.MANAGING_OFFICER_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      id: req.params.id,
      ...getFromApplicationData(req.session, managingOfficerType.ManagingOfficerKey, +req.params.id)
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.MANAGING_OFFICER_PAGE}`);

    const data: ApplicationDataType = prepareOfficerData(req.body);
    setApplicationData(req.session, data, managingOfficerType.ManagingOfficerKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`UPDATE ${config.MANAGING_OFFICER_PAGE}`);

    removeFromApplicationData(req.session, managingOfficerType.ManagingOfficerKey, +req.params.id);

    const data: ApplicationDataType = prepareOfficerData(req.body);
    setApplicationData(req.session, data, managingOfficerType.ManagingOfficerKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`REMOVE ${config.MANAGING_OFFICER_PAGE}`);

    removeFromApplicationData(req.session, managingOfficerType.ManagingOfficerKey, +req.params.id);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const prepareOfficerData = (reqBody): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, managingOfficerType.ManagingOfficerKeys);
  data[managingOfficerType.UsualResidentialAddressKey] = prepareData(reqBody, managingOfficerType.UsualResidentialAddressKeys);
  data[managingOfficerType.DateOfBirthKey] = prepareData(reqBody, managingOfficerType.DateOfBirthKeys);

  return data;
};
