import { REVIEW_BENEFICIAL_OWNER_INDEX_PARAM, UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, removeFromApplicationData, setApplicationData, getFromApplicationData, mapDataObjectToFields } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { ApplicationData, ApplicationDataType } from "../../model";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.individual";
import { v4 as uuidv4 } from "uuid";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from "@companieshouse/node-session-handler";
import { CeasedDateKey, CeasedDateKeys } from "../../model/date.model";
import { EntityNumberKey, InputDateKeys } from "../../model/data.types.model";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  const index = req.query.index;

  let dataToReview = {};
  let id = "";
  if (appData?.beneficial_owners_individual){
    dataToReview = appData?.beneficial_owners_individual[Number(index)];
    id = appData?.beneficial_owners_individual[Number(index)].id;
  }

  const data = getFromApplicationData(req, BeneficialOwnerIndividualKey, id, true);

  const backLinkUrl = getBackLinkUrl(appData, index);

  const templateOptions = {
    backLinkUrl,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    ...dataToReview,
    ...data,
    isOwnersReview: true
  };

  // extra data needed for update journey
  if (EntityNumberKey in appData && appData[EntityNumberKey] !== null) {
    templateOptions["is_still_bo"] = (Object.keys(data["ceased_date"]).length === 0) ? 1 : 0;
    templateOptions[EntityNumberKey] = appData[EntityNumberKey];
    templateOptions["ceased_date"] = (data) ? mapDataObjectToFields(data[CeasedDateKey], CeasedDateKeys, InputDateKeys) : {};
  }

  return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, templateOptions);

  // console.log(JSON.stringify(appData.beneficial_owners_individual));

  // return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
  //   backLinkUrl,
  //   templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  //   ...dataToReview,
  //   isOwnersReview: true
  // });
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
      // appData.beneficial_owners_individual[Number(boiIndex)].ceased_date = {day: "27", month: "4", year: "2023"}

      await saveAndContinue(req, session, false);

      res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
  } catch (error) {
    next(error);
  }
};
