import { NextFunction, Request, Response } from "express";

import { getDataForReview, postDataForReview } from "../../utils/check.your.answers";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDataForReview(req, res, next, true);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDataForReview(req, res, next);
};
