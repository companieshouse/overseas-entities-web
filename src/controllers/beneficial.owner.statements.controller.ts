// import {
//  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
// } from "../config";

import { NextFunction, Request, Response } from "express";

import { getBeneficialOwnerStatements, postBeneficialOwnerStatements } from "../utils/beneficial.owner.statements";
// import { isActiveFeature } from "../utils/feature.flag";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerStatements(req, res, next, true);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
//  let nextPageUrl = BENEFICIAL_OWNER_TYPE_URL;

  postBeneficialOwnerStatements(req, res, next, true);

};
