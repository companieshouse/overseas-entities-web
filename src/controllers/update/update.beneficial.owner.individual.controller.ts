import { NextFunction, Request, Response } from "express";

import {
  getBeneficialOwnerIndividual,
  getBeneficialOwnerIndividualById,
  postBeneficialOwnerIndividual,
  updateBeneficialOwnerIndividual
} from "../../utils/beneficial.owner.individual";

import {
  RELEVANT_PERIOD_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL
} from "../../config";

export const get = (req: Request, res: Response) => {
  const relevant_period = req.query["relevant-period"];
  const nextPage = relevant_period === "true" ? RELEVANT_PERIOD_BENEFICIAL_OWNER_INDIVIDUAL_PAGE : UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE;
  getBeneficialOwnerIndividual(req, res, nextPage, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerIndividualById(req, res, next, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};
