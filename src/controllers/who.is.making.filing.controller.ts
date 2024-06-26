import { NextFunction, Request, Response } from "express";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

import {
  WHO_IS_MAKING_FILING_PAGE,
  PRESENTER_URL,
  DUE_DILIGENCE_URL,
  DUE_DILIGENCE_WITH_PARAMS_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  OVERSEAS_ENTITY_DUE_DILIGENCE_URL,
  OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL,
  PRESENTER_WITH_PARAMS_URL
} from "../config";
import { getWhoIsFiling, postWhoIsFiling } from "../utils/who.is.making.filing";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  let backLinkUrl: string = PRESENTER_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = getUrlWithParamsToPath(PRESENTER_WITH_PARAMS_URL, req);
  }
  await getWhoIsFiling(req, res, next, WHO_IS_MAKING_FILING_PAGE, backLinkUrl);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = DUE_DILIGENCE_URL;
  let oeNextPageUrl = OVERSEAS_ENTITY_DUE_DILIGENCE_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(DUE_DILIGENCE_WITH_PARAMS_URL, req);
    oeNextPageUrl = getUrlWithParamsToPath(OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL, req);
  }
  postWhoIsFiling(req, res, next, nextPageUrl, oeNextPageUrl);
};
