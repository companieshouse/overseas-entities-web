import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { getFilterPage, postFilterPage } from "../../utils/secure.filter";
import { isActiveFeature } from "../../utils/feature.flag";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getFilterPage(req, res, next, config.SECURE_UPDATE_FILTER_PAGE, config.UPDATE_LANDING_PAGE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? config.UPDATE_INTERRUPT_CARD_WITH_PARAMS_URL : config.UPDATE_INTERRUPT_CARD_URL;
  const usePaperUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? config.UPDATE_USE_PAPER_WITH_PARAMS_URL : config.UPDATE_USE_PAPER_URL;
  postFilterPage(req, res, next, usePaperUrl, nextPageUrl);
};
