import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { getPresenterPage, postPresenterPage } from "../utils/presenter";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  let backLinkUrl = config.OVERSEAS_NAME_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    backLinkUrl = getUrlWithParamsToPath(config.OVERSEAS_NAME_WITH_PARAMS_URL, req);
  }

  await getPresenterPage(req, res, next, config.PRESENTER_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  let nextPageUrl = config.WHO_IS_MAKING_FILING_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL, req);
  }

  await postPresenterPage(req, res, next, nextPageUrl);
};
