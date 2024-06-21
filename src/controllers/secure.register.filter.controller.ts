import { Request, Response, NextFunction } from "express";

import * as config from "../config";
import { getFilterPage, postFilterPage } from "../utils/secure.filter";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  let backLinkUrl: string = config.SOLD_LAND_FILTER_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = getUrlWithParamsToPath(config.SOLD_LAND_FILTER_WITH_PARAMS_URL, req);
  }
  getFilterPage(req, res, next, config.SECURE_REGISTER_FILTER_PAGE, backLinkUrl);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postFilterPage(req, res, next, config.USE_PAPER_URL, config.INTERRUPT_CARD_URL);
};
