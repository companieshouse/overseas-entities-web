import { NextFunction, Request, Response } from "express";

import {
  getBeneficialOwnerIndividual,
  getBeneficialOwnerIndividualById,
  postBeneficialOwnerIndividual,
  updateBeneficialOwnerIndividual
} from "../../utils/beneficial.owner.individual";

import { UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerIndividual(req, res, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerIndividualById(req, res, next, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};
