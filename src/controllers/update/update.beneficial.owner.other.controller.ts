import { NextFunction, Request, Response } from "express";
import { UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";
import {
  getBeneficialOwnerOther,
  getBeneficialOwnerOtherById,
  postBeneficialOwnerOther,
  removeBeneficialOwnerOther,
  updateBeneficialOwnerOther
} from "../../utils/beneficial.owner.other";

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerOther(req, res, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerOtherById(req, res, next, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeBeneficialOwnerOther(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};
