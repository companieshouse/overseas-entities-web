import { NextFunction, Request, Response } from "express";

import { getTrustDetails, postTrustDetails } from "../utils/trust.details";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrustDetails(req, res, next, false, false);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postTrustDetails(req, res, next, false, false);
};
