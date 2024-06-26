import { NextFunction, Request, Response } from 'express';
import { getTrustInvolvedPage, postTrustInvolvedPage } from "../../utils/trust.involved";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getTrustInvolvedPage(req, res, next, true, false);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postTrustInvolvedPage(req, res, next, true, false);
};
