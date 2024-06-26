import { NextFunction, Request, Response } from "express";
import { getTrustDetails, postTrustDetails } from "../../utils/trust.details";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getTrustDetails(req, res, next, true, false);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postTrustDetails(req, res, next, true, false);
};
