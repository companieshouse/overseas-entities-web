import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { getDueDiligence, postDueDiligence } from "../utils/due.diligence";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDueDiligence(req, res, next, config.WHO_IS_MAKING_FILING_URL, config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDueDiligence(req, res, next, config.ENTITY_URL, true);
};
