import { NextFunction, Request, Response } from "express";
import { getBeneficialOwnerStatements, postBeneficialOwnerStatements } from "../../utils/beneficial.owner.statements";
import * as config from "../../config";

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getBeneficialOwnerStatements(req, resp, next, false, config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
};

export const post = (req: Request, resp: Response, next: NextFunction) => {
  postBeneficialOwnerStatements(req, resp, next, false, config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
};
