import { NextFunction, Request, Response } from "express";
import { UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";
import {
  getBeneficialOwnerGov,
  getBeneficialOwnerGovById,
  postBeneficialOwnerGov,
  updateBeneficialOwnerGov
} from "../../utils/beneficial.owner.gov";

export const get = (req: Request, res: Response) => {
  return getBeneficialOwnerGov(req, res, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  return getBeneficialOwnerGovById(req, res, next, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  return updateBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};
