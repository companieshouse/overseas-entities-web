import {
  REVIEW_BENEFICIAL_OWNER_INDEX_PARAM,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { ApplicationData, ApplicationDataType } from "../../model";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.individual";
import { v4 as uuidv4 } from "uuid";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from "@companieshouse/node-session-handler";
import { addCeasedDateToTemplateOptions } from "../../utils/update/ceased_date_util";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  const index = req.query.index;

  let dataToReview = {};
  if (appData?.beneficial_owners_individual){
    dataToReview = appData?.beneficial_owners_individual[Number(index)];
  }

  if (!dataToReview["ceased_date"]) {
    dataToReview["ceased_date"] = {};
  }

  const backLinkUrl = getBackLinkUrl(appData, index);

  const templateOptions = {
    backLinkUrl,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    ...dataToReview,
    isOwnersReview: true
  };

  return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, addCeasedDateToTemplateOptions(templateOptions, appData, dataToReview));

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
      const dateOfBirth = appData.beneficial_owners_individual[Number(boiIndex)].date_of_birth;
      removeFromApplicationData(req, BeneficialOwnerIndividualKey, boId);

      const session = req.session as Session;

      const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

      setApplicationData(req.session, data, BeneficialOwnerIndividualKey);

      appData.beneficial_owners_individual[Number(boiIndex)].date_of_birth = dateOfBirth;

      await saveAndContinue(req, session, false);

      res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
  } catch (error) {
    next(error);
  }
};
