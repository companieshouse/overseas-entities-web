import { NextFunction, Request, Response } from "express";

import {
  DUE_DILIGENCE_PAGE,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  WHO_IS_MAKING_FILING_URL,
  ENTITY_URL,
  ENTITY_WITH_PARAMS_URL, PRESENTER_URL
} from "../config";

import { getDueDiligencePage, postDueDiligencePage } from "../utils/due.diligence";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  let backLinkUrl: string = WHO_IS_MAKING_FILING_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = getUrlWithParamsToPath(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL, req);
  }
  getDueDiligencePage(req, res, next, DUE_DILIGENCE_PAGE, backLinkUrl);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = ENTITY_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(ENTITY_WITH_PARAMS_URL, req);
  }

  postDueDiligencePage(req, res, next, nextPageUrl, true);
};
