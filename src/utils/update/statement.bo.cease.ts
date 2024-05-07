import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { InputDate } from "../../model/data.types.model";
import { Update } from "../../model/update.type.model";
import { checkDateValueIsValid } from "../../validation/custom.validation";

const initializeRegistrationDate: InputDate = {
  day: "31",
  month: "01",
  year: "2023"
};

const updateRegistrationDate = (appData: ApplicationData): ApplicationData => {
  const date: InputDate = appData.update?.date_of_creation as InputDate;
  try {
    checkDateValueIsValid("Registration date does not exist.", date.day, date.month, date.year);
  } catch (error) {
    logger.info(error);
    (appData.update as Update).date_of_creation = initializeRegistrationDate;
  }

  return appData;
};

export const getStatmentBOCease = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      ...updateRegistrationDate(appData)
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

