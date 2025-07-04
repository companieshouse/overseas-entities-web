import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { OwnedLandKey } from "../../model/update.type.model";
import {
  ChangeBeneficiaryRelevantPeriodKey,
  ChangeBoRelevantPeriodKey,
  TrusteeInvolvedRelevantPeriodKey
} from "../../model/relevant.period.statment.model";
import { OverseasEntityKey, Transactionkey } from "../../model/data.types.model";
import { postTransaction } from "../../service/transaction.service";
import { createOverseasEntity } from "../../service/overseas.entities.service";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE,
      ...appData,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE}`);
    const session = req.session as Session;
    let redirectUrl: string;
    const appData: ApplicationData = await getApplicationData(session);
    const ownedLandKey = req.body[OwnedLandKey];

    if (!appData[Transactionkey]) {
      const transactionID = await postTransaction(req, session);
      appData[Transactionkey] = transactionID;
      appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
    }

    if (appData.update) {
      appData.update[OwnedLandKey] = ownedLandKey === "1";
    }

    if (ownedLandKey === '1') {
      redirectUrl = config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
    } else {
      if (appData.update) {
        appData.update[ChangeBoRelevantPeriodKey] = undefined;
        appData.update[TrusteeInvolvedRelevantPeriodKey] = undefined;
        appData.update[ChangeBeneficiaryRelevantPeriodKey] = undefined;
      }
      redirectUrl = config.UPDATE_FILING_DATE_URL;
    }

    setExtraData(session, appData);
    await saveAndContinue(req, session);

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
