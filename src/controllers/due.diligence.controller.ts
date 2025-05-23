import { NextFunction, Request, Response } from "express";
import { getDueDiligencePage, postDueDiligencePage } from "../utils/due.diligence";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

import {
  DUE_DILIGENCE_PAGE,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  WHO_IS_MAKING_FILING_URL,
  ENTITY_URL,
  ENTITY_WITH_PARAMS_URL,
  WHO_IS_MAKING_FILING_WITH_PARAMS_URL
} from "../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  let backLinkUrl: string = WHO_IS_MAKING_FILING_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = getUrlWithParamsToPath(WHO_IS_MAKING_FILING_WITH_PARAMS_URL, req);
  }
  await getDueDiligencePage(req, res, next, DUE_DILIGENCE_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = ENTITY_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(ENTITY_WITH_PARAMS_URL, req);
  }
  await postDueDiligencePage(req, res, next, nextPageUrl);
};
