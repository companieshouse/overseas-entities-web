import { REVIEW_BENEFICIAL_OWNER_INDEX_PARAM, UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { ApplicationData, ApplicationDataType } from "../../model";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.individual";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@companieshouse/node-session-handler";
import { saveAndContinue } from "../../utils/save.and.continue";
import { InputDate } from "model/data.types.model";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  const index = req.query.index;

  let dataToReview = {};
  if (appData?.beneficial_owners_individual){
    dataToReview = appData?.beneficial_owners_individual[Number(index)];
  }
  const backLinkUrl = getBackLinkUrl(appData, index);
  return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    ...dataToReview,
    isOwnersReview: true
  });
};

const getBackLinkUrl = (appData: ApplicationData, pageIndex) => {
  if (appData.beneficial_owners_individual?.length === 0 || pageIndex < 1){
    return UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL;
  } else {
    return UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL + REVIEW_BENEFICIAL_OWNER_INDEX_PARAM + (pageIndex - 1);
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

      req.body["date_of_birth-day"] = String(dob?.day).length > 1 ? dob?.day : String(dob?.day).padStart(2, '0');
      req.body["date_of_birth-month"] = String(dob?.month).length > 1 ? dob?.month : String(dob?.month).padStart(2, '0');
      req.body["date_of_birth-year"] = dob?.year;

      const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

      setApplicationData(req.session, data, BeneficialOwnerIndividualKey);
      await saveAndContinue(req, session, false);

      res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
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
  if (input.length > 1){
    return input;
  }
  return String(input).padStart(maxLength, fillString);
};
