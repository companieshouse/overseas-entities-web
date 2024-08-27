import { NextFunction, Request, Response } from "express";

import { getBeneficialOwnerStatements, postBeneficialOwnerStatements } from "../../utils/beneficial.owner.statements";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getBeneficialOwnerStatements(req, res, next, false);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postBeneficialOwnerStatements(req, res, next, false);
};
