import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { isActiveFeature } from "../../utils/feature.flag";
import { getApplicationData, setExtraData, mapFieldsToDataObject, mapDataObjectToFields } from "../../utils/application.data";
import { postTransaction } from "../../service/transaction.service";
import { createOverseasEntity, updateOverseasEntity } from "../../service/overseas.entities.service";
import { OverseasEntityKey, Transactionkey, InputDateKeys } from '../../model/data.types.model';
import { FilingDateKey, FilingDateKeys } from '../../model/date.model';
import { ApplicationData } from "../../model/application.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const filingDate = appData.update?.[FilingDateKey] ? mapDataObjectToFields(appData.update[FilingDateKey], FilingDateKeys, InputDateKeys) : {};

    return res.render(config.UPDATE_FILING_DATE_PAGE, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.UPDATE_FILING_DATE_PAGE,
      ...appData,
      [FilingDateKey]: filingDate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async(req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME)) {
      const appData: ApplicationData = getApplicationData(session);
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID, true);
      }
      if (appData.update) {
        appData.update[FilingDateKey] = mapFieldsToDataObject(req.body, FilingDateKeys, InputDateKeys);
        appData.update.review_trusts = [{
          trust_id: "1",
          trust_name: "Quail Kinney",
          creation_date_day: "12",
          creation_date_month: "6",
          creation_date_year: "2023",
          unable_to_obtain_all_trust_info: "No",
          HISTORICAL_BO: [{
            id: "8574560e-c196-4129-88c4-a44ebbecb53f",
            notified_date_day: "11",
            notified_date_month: "1",
            notified_date_year: "2023",
            ceased_date_day: "6",
            ceased_date_month: "6",
            ceased_date_year: "2023",
            corporate_indicator: 1,
            corporate_name: "trust 1 former",
            ch_references: "chref"
          }],
        }];
      }
      setExtraData(req.session, appData);
      await updateOverseasEntity(req, session);
    }

    return res.redirect(config.OVERSEAS_ENTITY_PRESENTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
