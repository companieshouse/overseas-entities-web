import { NextFunction, Request, Response } from "express";

import {
  WHO_IS_MAKING_FILING_PAGE,
  PRESENTER_URL,
  DUE_DILIGENCE_URL,
  OVERSEAS_ENTITY_DUE_DILIGENCE_URL
} from "../config";
import { getWhoIsFiling, postWhoIsFiling } from "../utils/who.is.making.filing";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getWhoIsFiling(req, res, next, WHO_IS_MAKING_FILING_PAGE, PRESENTER_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postWhoIsFiling(req, res, next, DUE_DILIGENCE_URL, OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
};
