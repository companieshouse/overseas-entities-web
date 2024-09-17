import * as config from "../config";
import { Request, Response } from "express";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";

export const get = (req: Request, res: Response) => {
  const backLinkUrl = req.params[config.ROUTE_PARAM_TRANSACTION_ID]
    && req.params[config.ROUTE_PARAM_SUBMISSION_ID]
    && isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithTransactionIdAndSubmissionId(config.SOLD_LAND_FILTER_WITH_PARAMS_URL, req.params[config.ROUTE_PARAM_TRANSACTION_ID], req.params[config.ROUTE_PARAM_SUBMISSION_ID])
    : config.SOLD_LAND_FILTER_URL;
  return res.render(config.CANNOT_USE_PAGE, {
    backLinkUrl,
    templateName: config.CANNOT_USE_PAGE
  });
};
