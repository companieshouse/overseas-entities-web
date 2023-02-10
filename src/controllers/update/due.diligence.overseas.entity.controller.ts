import { NextFunction, Request, Response } from "express";

import { getDueDiligence, postDueDiligence } from "../../utils/due.diligence";
import {
  WHO_IS_MAKING_UPDATE_URL,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE,
  OVERSEAS_ENTITY_REVIEW_URL
} from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDueDiligence(req, res, next, WHO_IS_MAKING_UPDATE_URL, UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDueDiligence(req, res, next, OVERSEAS_ENTITY_REVIEW_URL, false);
};
