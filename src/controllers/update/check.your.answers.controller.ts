import { NextFunction, Request, Response } from "express";

import { getDataForReview, postDataForReview } from "../../utils/check.your.answers";

// new change to try trigger sonarqube
export const get = (req: Request, res: Response, next: NextFunction) => {
  getDataForReview(req, res, next, false);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDataForReview(req, res, next);
};
