import { NextFunction, Request, Response } from "express";
import { getRegistrableBeneficialOwner, postRegistrableBeneficialOwner } from "../../utils/registrable.beneficial.owner";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getRegistrableBeneficialOwner(req, res, next);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postRegistrableBeneficialOwner(req, res, next);
};
