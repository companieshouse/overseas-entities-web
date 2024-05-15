import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { getRegistrationDate } from "../../utils/update/relevant.period";
// import { CombinedStatementPageKey } from "../../model/combined.page.for.statements.model";
import { InputDate } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.COMBINED_PAGE_FOR_STATEMENTS}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.COMBINED_PAGE_FOR_STATEMENTS, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.COMBINED_PAGE_FOR_STATEMENTS,
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
    logger.debugRequest(req, `POST ${config.COMBINED_PAGE_FOR_STATEMENTS}`);
    // const combinedStatementPageKey = req.body[CombinedStatementPageKey];

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
