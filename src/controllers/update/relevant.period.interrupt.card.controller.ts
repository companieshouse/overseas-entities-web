import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { InputDate } from "model/data.types.model";
import { getRegistrationDate } from "../../utils/update/relevant.period";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_INTERRUPT_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_INTERRUPT_PAGE, {
      backLinkUrl: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL,
      templateName: config.RELEVANT_PERIOD_INTERRUPT_PAGE,
      ...appData, dateOfCreation: getRegistrationDate(appData.update?.date_of_creation as InputDate)
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_INTERRUPT_PAGE}`);

    return res.redirect(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL); // redirects to statement 3 page
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
