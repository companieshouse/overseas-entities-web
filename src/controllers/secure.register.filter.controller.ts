import { Request, Response, NextFunction } from "express";

import * as config from "../config";
import { getFilterPage, postFilterPage } from "../utils/secure.filter";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getFilterPage(req, res, next, config.SECURE_REGISTER_FILTER_PAGE, config.SOLD_LAND_FILTER_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postFilterPage(req, res, next, config.USE_PAPER_URL, config.INTERRUPT_CARD_URL);
};
