import { NextFunction, Request, Response } from "express";

import { getBeneficialOwnerStatements, postBeneficialOwnerStatements } from "../utils/beneficial.owner.statements";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerStatements(req, res, next, true);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerStatements(req, res, next, true);
};
