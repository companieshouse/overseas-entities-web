import { Request, Response, NextFunction } from "express";

import * as config from "../config";
import { getFilterPage, postFilterPage } from "../utils/secure.filter";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  let backLinkUrl: string = config.SOLD_LAND_FILTER_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = getUrlWithParamsToPath(config.SOLD_LAND_FILTER_WITH_PARAMS_URL, req);
  }
  await getFilterPage(req, res, next, config.SECURE_REGISTER_FILTER_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = config.INTERRUPT_CARD_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(config.INTERRUPT_CARD_WITH_PARAMS_URL, req);
  }
  await postFilterPage(req, res, next, config.USE_PAPER_URL, nextPageUrl);
};
