import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { getFilterPage, postFilterPage } from "../../utils/secure.filter";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getFilterPage(req, res, next, config.SECURE_UPDATE_FILTER_PAGE, config.UPDATE_LANDING_PAGE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postFilterPage(req, res, next, config.UPDATE_USE_PAPER_URL, config.UPDATE_INTERRUPT_CARD_URL);
};
