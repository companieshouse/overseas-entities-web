import {
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE
} from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { ApplicationDataType } from "../../model";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.individual";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@companieshouse/node-session-handler";
import { saveAndContinue } from "../../utils/save.and.continue";
import { EntityNumberKey, InputDate } from "../../model/data.types.model";
import { addCeasedDateToTemplateOptions } from "../../utils/update/ceased_date_util";
import { CeasedDateKey } from "../../model/date.model";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  const index = req.query.index;

  let dataToReview = {};
  if (appData?.beneficial_owners_individual){
    dataToReview = appData?.beneficial_owners_individual[Number(index)];
  }

  const templateOptions = {
    backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    ...dataToReview,
    isBeneficialOwnersReview: true,
    populateResidentialAddress: false,
    entity_number: appData[EntityNumberKey],
  };

  // Ceased date is undefined and residential address is private for initial review of BO - don't set ceased date data or residential address in this scenario
  if (CeasedDateKey in dataToReview) {
    templateOptions.populateResidentialAddress = true;
    return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, addCeasedDateToTemplateOptions(templateOptions, appData, dataToReview));
  } else {
    return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, templateOptions);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const boiIndex = req.query.index;
    const appData = getApplicationData(req.session);

    if (boiIndex !== undefined && appData.beneficial_owners_individual && appData.beneficial_owners_individual[Number(boiIndex)].id === req.body["id"]){
      const boId = appData.beneficial_owners_individual[Number(boiIndex)].id;
      const dob = appData.beneficial_owners_individual[Number(boiIndex)].date_of_birth as InputDate;

      removeFromApplicationData(req, BeneficialOwnerIndividualKey, boId);

      setReviewedDateOfBirth(req, dob);

      const session = req.session as Session;

      const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

      setApplicationData(req.session, data, BeneficialOwnerIndividualKey);

      await saveAndContinue(req, session, false);
    }
    res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    next(error);
  }
};

export const setReviewedDateOfBirth = (req: Request, dob: InputDate) => {
  req.body["date_of_birth-day"] = padWithZero(dob?.day, 2, "0");
  req.body["date_of_birth-month"] = padWithZero(dob?.month, 2, "0");
  req.body["date_of_birth-year"] = padWithZero(dob?.year, 2, "0");
};

export const padWithZero = (input: string, maxLength: number, fillString: string): string => {
  if (input && input.length > 1){
    return input;
  }
  return String(input).padStart(maxLength, fillString);
};
