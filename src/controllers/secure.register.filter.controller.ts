import { Request, Response, NextFunction } from "express";

import * as config from "../config";
import { getFilterPage, postFilterPage } from "../utils/secure.filter";
import { isActiveFeature } from "../utils/feature.flag";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getFilterPage(req, res, next, config.SECURE_REGISTER_FILTER_PAGE, config.SOLD_LAND_FILTER_URL);
};

// @todo: remember to remove url parameters after update journey is updated for REDIS removal
export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? config.INTERRUPT_CARD_WITH_PARAMS_URL
    : config.INTERRUPT_CARD_URL;
  await postFilterPage(req, res, next, config.USE_PAPER_URL, nextPageUrl, true);
};
