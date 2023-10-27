import { NextFunction, Request, Response } from 'express';
import { getTrustInvolvedPage, postTrustInvolvedPage } from "../utils/trust.involved";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrustInvolvedPage(req, res, next, false, false);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postTrustInvolvedPage(req, res, next, false, false);
};
