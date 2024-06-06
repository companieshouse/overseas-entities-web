import { NextFunction, Request, Response } from "express";
import { isActiveFeature } from "../utils/feature.flag";
import {getUrlWithParamsToPath, getUrlWithTransactionIdAndSubmissionId} from "../utils/url";

import {
  WHO_IS_MAKING_FILING_PAGE,
  PRESENTER_URL,
  DUE_DILIGENCE_URL,
  DUE_DILIGENCE_WITH_PARAMS_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  OVERSEAS_ENTITY_DUE_DILIGENCE_URL,
  OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL
} from "../config";
import { getWhoIsFiling, postWhoIsFiling } from "../utils/who.is.making.filing";
import { getApplicationData } from "../utils/application.data";
import * as config from "../config";
import {OverseasEntityKey, Transactionkey} from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  let backLinkUrl: string = PRESENTER_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = getUrlWithParamsToPath(config.PRESENTER_WITH_PARAMS_URL, req);
  }
  getWhoIsFiling(req, res, next, WHO_IS_MAKING_FILING_PAGE, backLinkUrl);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = DUE_DILIGENCE_URL;
  let oeNextPageUrl = OVERSEAS_ENTITY_DUE_DILIGENCE_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(DUE_DILIGENCE_WITH_PARAMS_URL, req);
    oeNextPageUrl = getUrlWithParamsToPath(OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL, req);
  }
  console.log('next-page-urls');
  console.log(req.params);
  console.log(nextPageUrl);
  console.log(DUE_DILIGENCE_WITH_PARAMS_URL);
  console.log(oeNextPageUrl);

  console.log('app-data-new');
  console.log(getApplicationData(req.session));
  console.log(req.app);
  postWhoIsFiling(req, res, next, nextPageUrl, oeNextPageUrl);
};
