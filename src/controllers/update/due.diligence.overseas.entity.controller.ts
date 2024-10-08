import { NextFunction, Request, Response } from "express";

import { getDueDiligence, postDueDiligence } from "../../utils/overseas.due.diligence";
import {
  WHO_IS_MAKING_UPDATE_URL,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getDueDiligence(req, res, next, UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE, WHO_IS_MAKING_UPDATE_URL);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postDueDiligence(req, res, next, UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);
};
