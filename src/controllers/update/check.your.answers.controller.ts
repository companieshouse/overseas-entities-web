import { NextFunction, Request, Response } from "express";

import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE,
} from "../../config";
import { getDataForReview, postDataForReview } from "../../utils/check.your.answers";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDataForReview(req, res, next, UPDATE_CHECK_YOUR_ANSWERS_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDataForReview(req, res, next);
};
