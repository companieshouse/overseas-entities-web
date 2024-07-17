import { NextFunction, Request, Response } from "express";
import { UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";
import {
  getBeneficialOwnerOther,
  getBeneficialOwnerOtherById,
  postBeneficialOwnerOther,
  updateBeneficialOwnerOther
} from "../../utils/beneficial.owner.other";

export const get = async (req: Request, res: Response) => {
  await getBeneficialOwnerOther(req, res, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getBeneficialOwnerOtherById(req, res, next, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

