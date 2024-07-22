import { NextFunction, Request, Response } from "express";
import { UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL, RELEVANT_PERIOD_QUERY_PARAM } from "../../config";
import {
  getBeneficialOwnerOther,
  getBeneficialOwnerOtherById,
  updateBeneficialOwnerOther
} from "../../utils/beneficial.owner.other";
import { checkRelevantPeriod } from "../../utils/relevant.period";

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerOther(req, res, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerOtherById(req, res, next, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = checkRelevantPeriod(appData) ? UPDATE_BENEFICIAL_OWNER_TYPE_URL : UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM;
  postBeneficialOwnerIndividual(req, res, next, nextPageUrl, false);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

