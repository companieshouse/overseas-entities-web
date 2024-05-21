import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { getRegistrationDate } from "../../utils/update/relevant.period";
import { CombinedStatementPageKey } from "../../model/relevant.period.combined.statements.model";
import { InputDate } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
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
    const combinedStatementPageKey = req.body[CombinedStatementPageKey];

   // if (combinedStatementPageKey === '1') {
   //   return res.redirect(config.RELEVANT_PERIOD_INTERRUPT_URL); // redirect to interrupt screen
        return res.redirect(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
   // } else {
   //  return res.redirect(config.UPDATE_FILING_DATE_URL);
   // }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
