import { NextFunction, Request, Response } from "express";

import {
  WHO_IS_MAKING_UPDATE_PAGE,
  OVERSEAS_ENTITY_PRESENTER_URL,
} from "../../config";
import { getWhoIsFilling, postWhoIsFilling } from "../../utils/who.is.making.filing";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getWhoIsFilling(req, res, next, WHO_IS_MAKING_UPDATE_PAGE, OVERSEAS_ENTITY_PRESENTER_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postWhoIsFilling(req, res, next, false);
};
