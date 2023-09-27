import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { getPresenterPage, postPresenterPage } from "../utils/presenter";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getPresenterPage(req, res, next, config.PRESENTER_PAGE, config.OVERSEAS_NAME_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {

  let nextPageUrl = config.WHO_IS_MAKING_FILING_URL;

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL, req);
  }

  postPresenterPage(req, res, next, nextPageUrl, true);
};
