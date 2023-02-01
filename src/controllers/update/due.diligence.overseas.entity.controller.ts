import { NextFunction, Request, Response } from "express";

import { getDueDiligence, postDueDiligence } from "../../utils/due.diligence";
import {
  WHO_IS_MAKING_UPDATE_URL,
  OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE,
  OVERSEAS_ENTITY_REVIEW_URL
} from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDueDiligence(req, res, next, WHO_IS_MAKING_UPDATE_URL, OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDueDiligence(req, res, next, OVERSEAS_ENTITY_REVIEW_URL, false);
};
