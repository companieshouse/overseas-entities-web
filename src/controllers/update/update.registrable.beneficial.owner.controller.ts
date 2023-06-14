import { NextFunction, Request, Response } from "express";
import { getRegistrableBeneficialOwner, postRegistrableBeneficialOwner } from "../../utils/registrable.beneficial.owner";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getRegistrableBeneficialOwner(req, res, next);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postRegistrableBeneficialOwner(req, res, next);
};
