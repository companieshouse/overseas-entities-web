import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { getDueDiligence, postDueDiligence } from "../utils/overseas.due.diligence";
import { ENTITY_URL } from "../config";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDueDiligence(req, res, next, config.OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE, config.WHO_IS_MAKING_FILING_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = ENTITY_URL;
   if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
     nextPageUrl = getUrlWithParamsToPath(config.ENTITY_WITH_PARAMS_URL, req);
   }
  postDueDiligence(req, res, next, nextPageUrl, true);
};
