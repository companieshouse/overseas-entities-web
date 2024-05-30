import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { getRegistrationDate } from "../../utils/update/relevant.period";
import { InputDate, OverseasEntityKey, Transactionkey } from "../../model/data.types.model";
import {
  RelevantPeriodStatementsKey,
  RelevantPeriodStatementOneKey,
  RelevantPeriodStatementTwoKey,
  RelevantPeriodStatementThreeKey,
  RelevantPeriodStatementOne,
  RelevantPeriodStatementTwo,
  RelevantPeriodStatementThree
} from "../../model/relevant.period.statment.model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from "@companieshouse/node-session-handler";
import { postTransaction } from "../../service/transaction.service";
import { createOverseasEntity } from "../../service/overseas.entities.service";
import { isActiveFeature } from "../../utils/feature.flag";

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

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE}`);
    const session = req.session as Session;

    const appData: ApplicationData = getApplicationData(session);
    const statements = req.body[RelevantPeriodStatementsKey];

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME)) {
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID, true);
      }
      if (appData.update) {
        appData.update[RelevantPeriodStatementOneKey] = statements.includes(RelevantPeriodStatementOneKey) ? RelevantPeriodStatementOne.YES : RelevantPeriodStatementOne.NO;
        appData.update[RelevantPeriodStatementTwoKey] = statements.includes(RelevantPeriodStatementTwoKey) ? RelevantPeriodStatementTwo.YES : RelevantPeriodStatementTwo.NO;
        appData.update[RelevantPeriodStatementThreeKey] = statements.includes(RelevantPeriodStatementThreeKey) ? RelevantPeriodStatementThree.YES : RelevantPeriodStatementThree.NO;
      }
      setExtraData(session, appData);
      await saveAndContinue(req, session, false);
    }

    return res.redirect(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
