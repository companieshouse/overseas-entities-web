import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, managingOfficerType } from "../model";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.MANAGING_OFFICER_PAGE}`);

  const appData: ApplicationData = getApplicationData(req.session);

  console.log(JSON.stringify(appData, null, 2));

  return res.render(config.MANAGING_OFFICER_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_OTHER_URL,
    ...appData.managingOfficer
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.MANAGING_OFFICER_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, managingOfficerType.ManagingOfficerKeys);
    data[managingOfficerType.UsualResidentialAddressKey] = prepareData(req.body, managingOfficerType.UsualResidentialAddressKeys);
    data[managingOfficerType.DateOfBirthKey] = prepareData(req.body, managingOfficerType.DateOfBirthKeys);

    setApplicationData(req.session, data, managingOfficerType.ManagingOfficerKey);

    console.log(JSON.stringify(data, null, 2));

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

