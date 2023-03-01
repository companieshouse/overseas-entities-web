import { NextFunction, Request, Response } from "express";
import { BENEFICIAL_OWNER_OTHER_PAGE, BENEFICIAL_OWNER_TYPE_URL } from "../config";
import {
  getBeneficialOwnerOther,
  getBeneficialOwnerOtherById,
  postBeneficialOwnerOther,
  removeBeneficialOwnerOther,
  updateBeneficialOwnerOther
} from "../utils/beneficial.owner.other";

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerOther(req, res, BENEFICIAL_OWNER_OTHER_PAGE, BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerOtherById(req, res, next, BENEFICIAL_OWNER_OTHER_PAGE, BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerOther(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerOther(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeBeneficialOwnerOther(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};
