import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { getRegistrationDate } from "../../utils/update/relevant.period";
import { InputDate } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE, {
      backLinkUrl: config.RELEVANT_PERIOD_INTERRUPT_PAGE,
      templateName: config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE,
      ...appData,
      dateOfCreation: getRegistrationDate(appData.update?.date_of_creation as InputDate)
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE}`);
    // Should store checked checkbox values in array
    const pageData = Object.values(req.body.combined_page_for_statements);
    // Checks for any statement other than 'None of these'
    const hasSelectedStatement = pageData.some(option => option !== "NONE_OF_THESE");

    if (hasSelectedStatement) {
      // One or more checkboxes other than 'None of these' was checked
      return res.redirect(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
    } 
    if (pageData.includes("NONE_OF_THESE")) {
      // The checkbox 'None of these' was checked
      return res.redirect(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
    } 
    /* else {
      logger.error("No checkbox was checked");
      throw new Error("Select the statements that apply or select 'None of these'");
    } */
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
