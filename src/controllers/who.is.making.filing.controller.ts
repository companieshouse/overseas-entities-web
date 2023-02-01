import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { getWhoIsFilling, postWhoIsFilling } from "../utils/who.is.making.filing";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getWhoIsFilling(req, res, next, config.WHO_IS_MAKING_FILING_PAGE, config.PRESENTER_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postWhoIsFilling(req, res, next, true);
};
