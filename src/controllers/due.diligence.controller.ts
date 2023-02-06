import { NextFunction, Request, Response } from "express";

import {
  DUE_DILIGENCE_PAGE,
  WHO_IS_MAKING_FILING_URL,
  ENTITY_URL

} from "../config";

import { getDueDiligencePage, postDueDiligencePage } from "../utils/due-diligence";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDueDiligencePage(req, res, next, DUE_DILIGENCE_PAGE, WHO_IS_MAKING_FILING_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDueDiligencePage(req, res, next, ENTITY_URL, true);
};
