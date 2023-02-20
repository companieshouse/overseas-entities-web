import { NextFunction, Request, Response } from "express";

import {
  getBeneficialOwnerIndividual,
  getBeneficialOwnerIndividualById,
  postBeneficialOwnerIndividual,
  removeBeneficialOwnerIndividual,
  updateBeneficialOwnerIndividual
} from "../utils/beneficial.owner.individual";

import { BENEFICIAL_OWNER_INDIVIDUAL_PAGE, BENEFICIAL_OWNER_TYPE_URL } from "../config";

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerIndividual(req, res, BENEFICIAL_OWNER_INDIVIDUAL_PAGE, BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerIndividualById(req, res, next, BENEFICIAL_OWNER_INDIVIDUAL_PAGE, BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerIndividual(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerIndividual(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeBeneficialOwnerIndividual(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};
