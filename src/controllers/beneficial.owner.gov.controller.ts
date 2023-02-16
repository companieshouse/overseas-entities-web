import { NextFunction, Request, Response } from "express";
import { BENEFICIAL_OWNER_GOV_PAGE, BENEFICIAL_OWNER_TYPE_URL } from "../config";
import { getBeneficialOwnerGov, getBeneficialOwnerGovById, postBeneficialOwnerGov, removeBeneficialOwnerGov, updateBeneficialOwnerGov } from "../utils/beneficial.owner.gov";

export const get = (req: Request, res: Response) => {
  return getBeneficialOwnerGov(req, res, BENEFICIAL_OWNER_GOV_PAGE, BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  return getBeneficialOwnerGovById(req, res, next, BENEFICIAL_OWNER_GOV_PAGE, BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerGov(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  return updateBeneficialOwnerGov(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  return removeBeneficialOwnerGov(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};
