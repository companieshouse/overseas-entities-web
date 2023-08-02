import { NextFunction, Request, Response } from 'express';
import { getTrustInvolvedPage, postTrustInvolvedPage } from "../utils/trust/trust.involved";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrustInvolvedPage(req, res, next, false);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postTrustInvolvedPage(req, res, next, false);
};
