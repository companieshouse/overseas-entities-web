import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { createAndLogErrorRequest, logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData, mapFieldsToDataObject, mapDataObjectToFields } from "../../utils/application.data";
import { postTransaction } from "../../service/transaction.service";
import { createOverseasEntity, updateOverseasEntity } from "../../service/overseas.entities.service";
import { OverseasEntityKey, Transactionkey, InputDateKeys } from '../../model/data.types.model';
import { FilingDateKey, FilingDateKeys } from '../../model/date.model';
import { ApplicationData } from "../../model/application.model";
import { getConfirmationStatementNextMadeUpToDateAsIsoString } from "../../service/company.profile.service";
import { convertIsoDateToInputDate } from "../../utils/date";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { isActiveFeature } from "../../utils/feature.flag";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = await getApplicationData(req.session);
    let backLinkUrl: string ;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD) && !appData.entity?.has_answered_relevant_period_question) {
      backLinkUrl = !checkRelevantPeriod(appData) ? config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL : config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
    } else {
      backLinkUrl = config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE;
    }

    return res.render(config.UPDATE_FILING_DATE_PAGE, {
      backLinkUrl,
      templateName: config.UPDATE_FILING_DATE_PAGE,
      chsUrl: config.CHS_URL,
      ...appData,
      [FilingDateKey]: await getFilingDate(req, appData)
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;

    const appData: ApplicationData = await getApplicationData(session);
    if (!appData[Transactionkey]) {
      const transactionID = await postTransaction(req, session);
      appData[Transactionkey] = transactionID;
      appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
    }
    if (appData.update) {
      appData.update[FilingDateKey] = mapFieldsToDataObject(req.body, FilingDateKeys, InputDateKeys);
    }
    setExtraData(req.session, appData);
    await updateOverseasEntity(req, session);

    return res.redirect(config.OVERSEAS_ENTITY_PRESENTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getFilingDate = async (req: Request, appData: ApplicationData): Promise<{} | undefined> => {
  // use date stored in appData if present, indicates that a value has already been entered on this page by user.
  let filingDate = appData.update?.[FilingDateKey] ? mapDataObjectToFields(appData.update[FilingDateKey], FilingDateKeys, InputDateKeys) : undefined;

  // otherwise use the next made up to date from confirmation statement in company profile, this is the first visit to the page so they wouldn't
  //  have already enetered a date, so pre-populate page with the next made up to date. User can then use that or change it to a different date.
  if (!filingDate) {
    if (!appData.entity_number) {
      throw createAndLogErrorRequest(req, `update.filing.date.controller unable to find entity_number in application data for entity_name ${appData.entity_name}`);
    }
    logger.debugRequest(req, `Getting confirmation statement next made up to date for entity number = ${appData.entity_number}`);
    const nextMudIsoString = await getConfirmationStatementNextMadeUpToDateAsIsoString(req, appData.entity_number);
    if (!nextMudIsoString) {
      throw createAndLogErrorRequest(req, `No confirmation statement next made up to date found on company profile for entity number = ${appData.entity_number}; transaction id = ${appData.transaction_id}`);
    }
    const nextMudAsInputDate = convertIsoDateToInputDate(nextMudIsoString);
    filingDate = mapDataObjectToFields(nextMudAsInputDate, FilingDateKeys, InputDateKeys);
  }
  return filingDate;
};
