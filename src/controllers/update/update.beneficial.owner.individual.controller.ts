import { NextFunction, Request, Response } from "express";

import {
  getBeneficialOwnerIndividual,
  getBeneficialOwnerIndividualById,
  postBeneficialOwnerIndividual,
  updateBeneficialOwnerIndividual
} from "../../utils/beneficial.owner.individual";

import { UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";

export const get = async (req: Request, res: Response) => {
  await getBeneficialOwnerIndividual(req, res, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getBeneficialOwnerIndividualById(req, res, next, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};
