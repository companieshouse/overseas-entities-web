import { NextFunction, Request, Response } from "express";

import {
  WHO_IS_MAKING_UPDATE_PAGE,
  OVERSEAS_ENTITY_PRESENTER_URL,
  UPDATE_DUE_DILIGENCE_URL,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL
} from "../../config";
import { getWhoIsFiling, postWhoIsFiling } from "../../utils/who.is.making.filing";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getWhoIsFiling(req, res, next, WHO_IS_MAKING_UPDATE_PAGE, OVERSEAS_ENTITY_PRESENTER_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postWhoIsFiling(req, res, next, UPDATE_DUE_DILIGENCE_URL, UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);
};
