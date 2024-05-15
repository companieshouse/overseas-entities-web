import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { getRegistrationDate } from "../../utils/update/relevant.period";
import { InputDate } from "../../model/data.types.model";
import {
  RelevantPeriodStatementsKey,
  RelevantPeriodStatementsType,
  RelevantPeriodStatementOne,
  RelevantPeriodStatementTwo,
  RelevantPeriodStatementThree
} from "../../model/relevant.period.statment.model";

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
    const appData: ApplicationData = getApplicationData(req.session);
    const statements = req.body[RelevantPeriodStatementsKey];

    if (appData.update) {
      appData.update.confirmation_change_to_BO_info_relevant_period = statements.includes(RelevantPeriodStatementOne) ? RelevantPeriodStatementsType[RelevantPeriodStatementOne] : RelevantPeriodStatementsType["NO_" + RelevantPeriodStatementOne];
      appData.update.confirmation_change_to_BO_trusts_relevant_period = statements.includes(RelevantPeriodStatementTwo) ? RelevantPeriodStatementsType[RelevantPeriodStatementTwo] : RelevantPeriodStatementsType["NO_" + RelevantPeriodStatementTwo];
      appData.update.confirmation_change_to_BO_beneficiaries_relevant_period = statements.includes(RelevantPeriodStatementThree) ? RelevantPeriodStatementsType[RelevantPeriodStatementThree] : RelevantPeriodStatementsType["NO_" + RelevantPeriodStatementThree];
    }

    console.log(appData);

    return res.redirect(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
