import { NextFunction, Request, Response } from "express";

import {
  UPDATE_REVIEW_STATEMENT_PAGE,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL
} from "../../config";
import { getDataForReview, postDataForReview } from "../../utils/check.your.answers";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDataForReview(req, res, next, UPDATE_REVIEW_STATEMENT_PAGE, UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL, true);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDataForReview(req, res, next);
};
