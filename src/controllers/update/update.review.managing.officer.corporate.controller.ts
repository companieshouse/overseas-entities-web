import {
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE,
  RELEVANT_PERIOD_QUERY_PARAM
} from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, mapDataObjectToFields, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationDataType } from "../../model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { AddressKeys } from "../../model/data.types.model";
import { setOfficerData } from "../../utils/managing.officer.corporate";
import { ResignedOnKey } from "../../model/date.model";
import { addResignedDateToTemplateOptions } from "../../utils/update/ceased_date_util";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../../model/address.model";
import { ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { checkRelevantPeriod } from "../../utils/relevant.period";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = await getApplicationData(req.session);
    const index = req.query.index;

    let dataToReview = {}, principalAddress = {}, serviceAddress = {};

    if (appData?.managing_officers_corporate){
      dataToReview = appData?.managing_officers_corporate[Number(index)];
      principalAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
      serviceAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    }

    const templateOptions = {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
      templateName: UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE,
      ...dataToReview,
      ...principalAddress,
      ...serviceAddress
    };

    if (ResignedOnKey in dataToReview) {
      return res.render(templateOptions.templateName, addResignedDateToTemplateOptions(templateOptions, appData, dataToReview));
    } else {
      return res.render(templateOptions.templateName, templateOptions);
    }
  } catch (error){
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const moIndex = req.query.index;
    const appData = await getApplicationData(req.session);

    if (moIndex !== undefined && appData.managing_officers_corporate && appData.managing_officers_corporate[Number(moIndex)].id === req.body["id"]){

      const moId = appData.managing_officers_corporate[Number(moIndex)].id;

      // Remove old Managing Officer
      await removeFromApplicationData(req, ManagingOfficerCorporateKey, moId);

      // Set officer data
      const data: ApplicationDataType = setOfficerData(req.body, moId);

      // Save new Managing Officer
      const session = req.session as Session;
      await setApplicationData(session, data, ManagingOfficerCorporateKey);

      await saveAndContinue(req, session);
    }
    if (checkRelevantPeriod(appData)) {
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
    } else {
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
  } catch (error){
    logger.errorRequest(req, error);
    next(error);
  }
};
