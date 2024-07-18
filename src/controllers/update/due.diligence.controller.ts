import { NextFunction, Request, Response } from "express";

import {
  UPDATE_DUE_DILIGENCE_PAGE,
  WHO_IS_MAKING_UPDATE_URL,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL
} from "../../config";

import { getDueDiligencePage, postDueDiligencePage } from "../../utils/due.diligence";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDueDiligencePage(req, res, next, UPDATE_DUE_DILIGENCE_PAGE, WHO_IS_MAKING_UPDATE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDueDiligencePage(req, res, next, UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);
};
