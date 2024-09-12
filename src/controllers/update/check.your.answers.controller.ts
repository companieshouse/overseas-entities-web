import { NextFunction, Request, Response } from "express";

import { getDataForReview, postDataForReview } from "../../utils/check.your.answers";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getDataForReview(req, res, next, false);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postDataForReview(req, res, next);
};
