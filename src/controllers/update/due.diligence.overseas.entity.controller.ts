import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { getDueDeligence, postDueDeligence } from "../../utils/due.diligence";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDueDeligence(req, res, next, config.WHO_IS_MAKING_UPDATE_URL, config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDueDeligence(req, res, next, config.OVERSEAS_ENTITY_REVIEW_URL, false);
};
