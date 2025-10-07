import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE, RELEVANT_PERIOD_QUERY_PARAM } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, mapDataObjectToFields, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { ManagingOfficerKey } from "../../model/managing.officer.model";
import { setReviewedDateOfBirth } from "./update.review.beneficial.owner.individual";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationDataType } from "../../model";
import { v4 as uuidv4 } from "uuid";
import { saveAndContinue } from "../../utils/save.and.continue";
import { AddressKeys, InputDate } from "../../model/data.types.model";
import { setOfficerData } from "../../utils/managing.officer.individual";
import { HaveDayOfBirthKey, ResignedOnKey } from "../../model/date.model";
import { addResignedDateToTemplateOptions } from "../../utils/update/ceased_date_util";
import { ServiceAddressKey, ServiceAddressKeys, UsualResidentialAddressKey, UsualResidentialAddressKeys } from "../../model/address.model";
import { checkRelevantPeriod } from "../../utils/relevant.period";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = await getApplicationData(req.session);
    const index = req.query.index;

    let dataToReview = {}, residentialAddress = {}, serviceAddress = {};

    if (appData?.managing_officers_individual){
      dataToReview = appData?.managing_officers_individual[Number(index)];
      residentialAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys) : {};

      serviceAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    }

    const templateOptions = {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
      templateName: UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE,
      ...dataToReview,
      ...residentialAddress,
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

    if (moIndex !== undefined && appData.managing_officers_individual && appData.managing_officers_individual[Number(moIndex)].id === req.body["id"]){

      const moId = appData.managing_officers_individual[Number(moIndex)].id;
      const dob = appData.managing_officers_individual[Number(moIndex)].date_of_birth as InputDate;
      const haveDayOfBirth = appData.managing_officers_individual[Number(moIndex)].have_day_of_birth;

      await removeFromApplicationData(req, ManagingOfficerKey, moId);

      setReviewedDateOfBirth(req, dob);
      const session = req.session as Session;

      const data: ApplicationDataType = setOfficerData(req.body, uuidv4());
      if (haveDayOfBirth) {
        data[HaveDayOfBirthKey] = haveDayOfBirth;
      }

      await setApplicationData(req.session, data, ManagingOfficerKey);

      await saveAndContinue(req, session);
    }
    if (checkRelevantPeriod(appData)) {
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
    } else {
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
  } catch (error){
    next(error);
  }
};
