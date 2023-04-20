import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { ApplicationDataType } from "../../model";
import { setBeneficialOwnerData, updateBeneficialOwnerIndividual } from "../../utils/beneficial.owner.individual";
import { v4 as uuidv4 } from "uuid";
import { config } from "process";
import app from "app";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  const index = req.query.index;

  let dataToReview = {};
  if (appData?.beneficial_owners_individual){
    dataToReview = appData?.beneficial_owners_individual[Number(index)] as BeneficialOwnerIndividual;
  }


  return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    ...dataToReview,
    isOwnersReview: true
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const boiIndex = req.query.index;
    const appData = getApplicationData(req.session);
    if ((boiIndex !== undefined  && appData.beneficial_owners_individual) && appData.beneficial_owners_individual[Number(boiIndex)].id === req.body["id"]){
      const boId =appData.beneficial_owners_individual[Number(boiIndex)].id;

        removeFromApplicationData(req, BeneficialOwnerIndividualKey, boId)

        const ch_reference_uuid = uuidv4();
        appData.beneficial_owners_individual[Number(boiIndex)].ch_reference = ch_reference_uuid;
        const data: ApplicationDataType = setBeneficialOwnerData(req.body, ch_reference_uuid);
        setApplicationData(req.session, data, BeneficialOwnerIndividualKey);
        // await saveAndContinue(req, session, false);
      res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
    }
catch (error) {
  next(error);
}
};




