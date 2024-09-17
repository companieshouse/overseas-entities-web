import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { getDueDiligence, postDueDiligence } from "../utils/overseas.due.diligence";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  let backLinkUrl: string = config.WHO_IS_MAKING_FILING_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = getUrlWithParamsToPath(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL, req);
  }
  await getDueDiligence(req, res, next, config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = config.ENTITY_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.ENTITY_WITH_PARAMS_URL, req);
  }
  await postDueDiligence(req, res, next, nextPageUrl);
};
