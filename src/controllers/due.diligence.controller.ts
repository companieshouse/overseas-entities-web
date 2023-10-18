import { NextFunction, Request, Response } from "express";

import {
  DUE_DILIGENCE_PAGE,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  WHO_IS_MAKING_FILING_URL,
  ENTITY_URL,
  ENTITY_WITH_PARAMS_URL
} from "../config";

import { getDueDiligencePage, postDueDiligencePage } from "../utils/due.diligence";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDueDiligencePage(req, res, next, DUE_DILIGENCE_PAGE, WHO_IS_MAKING_FILING_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = ENTITY_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(ENTITY_WITH_PARAMS_URL, req);
  }

  postDueDiligencePage(req, res, next, nextPageUrl, true);
};
