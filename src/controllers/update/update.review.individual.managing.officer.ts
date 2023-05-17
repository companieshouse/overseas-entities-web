import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { ManagingOfficerKey } from "../../model/managing.officer.model";
import { setReviewedDateOfBirth } from "./update.review.beneficial.owner.individual";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationDataType } from "../../model";
import { v4 as uuidv4 } from "uuid";
import { saveAndContinue } from "../../utils/save.and.continue";
import { InputDate } from "../../model/data.types.model";
import { setOfficerData } from "../../utils/managing.officer.individual";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = getApplicationData(req.session);
    const index = req.query.index;

    let dataToReview = {};

    if (appData?.managing_officers_individual){
      dataToReview = appData?.managing_officers_individual[Number(index)];
    }

    console.log(`data to review is ${JSON.stringify(dataToReview)}`);

    const templateOptions = {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
      templateName: UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE,
      ...dataToReview,
      isOwnersReview: true
    };
    return res.render(templateOptions.templateName, templateOptions);
  } catch (error){
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const moIndex = req.query.index;
    const appData = getApplicationData(req.session);

    console.log(`managing officer is ${JSON.stringify(appData.managing_officers_individual)}`);
    if (moIndex !== undefined && appData.managing_officers_individual && appData.managing_officers_individual[Number(moIndex)].id === req.body["id"]){

      const moId = appData.managing_officers_individual[Number(moIndex)].id;
      const dob = appData.managing_officers_individual[Number(moIndex)].date_of_birth as InputDate;

      removeFromApplicationData(req, ManagingOfficerKey, moId);

      setReviewedDateOfBirth(req, dob);

      const session = req.session as Session;

      const data: ApplicationDataType = setOfficerData(req.body, uuidv4());

      setApplicationData(req.session, data, ManagingOfficerKey);
      console.log(`after setting data ${appData.managing_officers_individual}`);
      await saveAndContinue(req, session, false);
    }
    res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  } catch (error){
    next(error);
  }
};
