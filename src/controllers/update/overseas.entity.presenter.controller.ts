import * as config from "../../config";
import { NextFunction, Request, Response } from "express";
import { getPresenterPage, postPresenterPage } from "../../utils/presenter";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getPresenterPage(req, res, next, config.UPDATE_PRESENTER_PAGE, config.UPDATE_FILING_DATE_URL);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postPresenterPage(req, res, next, config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL, false);
};
