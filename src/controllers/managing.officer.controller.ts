import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, officerType } from "../model";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET MANAGING_OFFICER_PAGE`);

  const appData: ApplicationData = getApplicationData(req.session);
  console.log(appData.officer);

  return res.render(config.MANAGING_OFFICER_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_OTHER_URL,
    ...appData.officer
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST MANAGING_OFFICER_PAGE`);

    const data: ApplicationDataType = prepareData(req.body, officerType.OfficerKeys);
    data[officerType.ResidentialAddressKey] = prepareData(req.body, officerType.ResidentialAddressKeys);

    setApplicationData(req.session, data, officerType.OfficerKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

