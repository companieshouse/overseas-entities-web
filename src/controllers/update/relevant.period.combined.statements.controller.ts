import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { getRegistrationDate } from "../../utils/update/relevant.period";
import { InputDate } from "../../model/data.types.model";
import {
  RelevantPeriodStatementsKey,
  RelevantPeriodStatementOneKey,
  RelevantPeriodStatementTwoKey,
  RelevantPeriodStatementThreeKey,
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
      appData.update.ceased_to_be_registrable_beneficial_owner = statements.includes(RelevantPeriodStatementOneKey) ? RelevantPeriodStatementOne.YES : RelevantPeriodStatementOne.NO;
      appData.update.trust_involved_in_the_oe = statements.includes(RelevantPeriodStatementTwoKey) ? RelevantPeriodStatementTwo.YES : RelevantPeriodStatementTwo.NO;
      appData.update.become_or_ceased_beneficiary_of_a_trust = statements.includes(RelevantPeriodStatementThreeKey) ? RelevantPeriodStatementThree.YES : RelevantPeriodStatementThree.NO;
    }

    console.log(appData);

    return res.redirect(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
