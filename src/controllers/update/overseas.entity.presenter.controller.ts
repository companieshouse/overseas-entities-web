import * as config from "../../config";
import { NextFunction, Request, Response } from "express";
import { getPresenterPage, postPresenterPage } from "../../utils/presenter";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getPresenterPage(req, res, next, config.UPDATE_PRESENTER_PAGE, config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postPresenterPage(req, res, next, config.WHO_IS_MAKING_UPDATE_URL, false);
};
