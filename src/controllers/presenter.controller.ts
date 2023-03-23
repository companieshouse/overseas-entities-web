import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { getPresenterPage, postPresenterPage } from "../utils/presenter";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getPresenterPage(req, res, next, config.PRESENTER_PAGE, config.OVERSEAS_NAME_URL, true);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postPresenterPage(req, res, next, config.WHO_IS_MAKING_FILING_URL, true);
};
