import { NextFunction, Request, Response } from "express";
import { UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL, RELEVANT_PERIOD_QUERY_PARAM } from "../../config";
import {
  getBeneficialOwnerGov,
  getBeneficialOwnerGovById,
  postBeneficialOwnerGov,
  updateBeneficialOwnerGov
} from "../../utils/beneficial.owner.gov";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response) => {
  return await getBeneficialOwnerGov(req, res, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  return getBeneficialOwnerGovById(req, res, next, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  const appData: ApplicationData = getApplicationData(req.session);
  if (checkRelevantPeriod(appData)) {
    postBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    postBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  const appData: ApplicationData = getApplicationData(req.session);
  if (checkRelevantPeriod(appData)) {
    updateBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    updateBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  }
};
