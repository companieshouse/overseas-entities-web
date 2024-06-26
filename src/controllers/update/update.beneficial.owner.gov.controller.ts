import { NextFunction, Request, Response } from "express";
import { UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";
import {
  getBeneficialOwnerGov,
  getBeneficialOwnerGovById,
  postBeneficialOwnerGov,
  updateBeneficialOwnerGov
} from "../../utils/beneficial.owner.gov";

export const get = async (req: Request, res: Response) => {
  return await getBeneficialOwnerGov(req, res, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  return await getBeneficialOwnerGovById(req, res, next, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  return updateBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};
