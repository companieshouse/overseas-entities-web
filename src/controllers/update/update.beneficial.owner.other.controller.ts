import { NextFunction, Request, Response } from "express";
import { UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL, RELEVANT_PERIOD_QUERY_PARAM } from "../../config";
import {
  getBeneficialOwnerOther,
  getBeneficialOwnerOtherById,
  postBeneficialOwnerOther,
  updateBeneficialOwnerOther
} from "../../utils/beneficial.owner.other";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerOther(req, res, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerOtherById(req, res, next, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  const appData: ApplicationData = getApplicationData(req.session);
  if (checkRelevantPeriod(appData)) {
    postBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    postBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

