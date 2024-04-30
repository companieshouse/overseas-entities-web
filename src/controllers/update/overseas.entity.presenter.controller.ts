import * as config from "../../config";
import { NextFunction, Request, Response } from "express";
import { getPresenterPage, postPresenterPage } from "../../utils/presenter";
import { isActiveFeature } from "../../utils/feature.flag";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getPresenterPage(req, res, next, config.UPDATE_PRESENTER_PAGE, config.UPDATE_FILING_DATE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {

  let nextPageUrl = config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD)) {
    nextPageUrl = config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE;
  }

  postPresenterPage(req, res, next, nextPageUrl, false);
};
