import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import { getRedirectUrl } from "../../utils/url";
import { isActiveFeature } from "../../utils/feature.flag";
import { ApplicationData } from "../../model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { postTransaction } from "../../service/transaction.service";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { OverseasEntityKey, Transactionkey } from "../../model/data.types.model";
import { createOverseasEntity, updateOverseasEntity } from "../../service/overseas.entities.service";

import {
  ChangeBoRelevantPeriodKey,
  ChangeBoRelevantPeriodType,
  RelevantPeriodStatementsKey,
  TrusteeInvolvedRelevantPeriodKey,
  TrusteeInvolvedRelevantPeriodType,
  ChangeBeneficiaryRelevantPeriodKey,
  ChangeBeneficiaryRelevantPeriodType,
} from "../../model/relevant.period.statment.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req);

    return res.render(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE, {
      ...appData,
      templateName: config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE,
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL,
      }) + config.RELEVANT_PERIOD_QUERY_PARAM,
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
    const appData: ApplicationData = await getApplicationData(req);
    const statements = req.body[RelevantPeriodStatementsKey];

    if (!appData[Transactionkey]) {
      const transactionID = await postTransaction(req, session);
      appData[Transactionkey] = transactionID;
      appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
    }

    if (appData.update) {
      appData.update[ChangeBoRelevantPeriodKey] = statements.includes(ChangeBoRelevantPeriodKey) ? ChangeBoRelevantPeriodType.YES : ChangeBoRelevantPeriodType.NO;
      appData.update[TrusteeInvolvedRelevantPeriodKey] = statements.includes(TrusteeInvolvedRelevantPeriodKey) ? TrusteeInvolvedRelevantPeriodType.YES : TrusteeInvolvedRelevantPeriodType.NO;
      appData.update[ChangeBeneficiaryRelevantPeriodKey] = statements.includes(ChangeBeneficiaryRelevantPeriodKey) ? ChangeBeneficiaryRelevantPeriodType.YES : ChangeBeneficiaryRelevantPeriodType.NO;
    }
    setExtraData(session, appData);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      await updateOverseasEntity(req, session, appData);
    } else {
      await saveAndContinue(req, session);
    }

    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: config.RELEVANT_PERIOD_REVIEW_STATEMENTS_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL,
    }) + config.RELEVANT_PERIOD_QUERY_PARAM);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
