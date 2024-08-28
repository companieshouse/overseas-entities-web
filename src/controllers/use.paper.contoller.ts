import * as config from "../config";
import { Request, Response } from "express";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";

export const get = (req: Request, res: Response) => {
  const applyWithPaperFormHeading: string = "You'll need to apply using the paper form";
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithTransactionIdAndSubmissionId(config.SECURE_REGISTER_FILTER_WITH_PARAMS_URL, req.params[config.ROUTE_PARAM_TRANSACTION_ID], req.params[config.ROUTE_PARAM_SUBMISSION_ID])
    : config.SECURE_REGISTER_FILTER_URL;
  return res.render(config.USE_PAPER_PAGE, {
    backLinkUrl,
    templateName: config.USE_PAPER_PAGE,
    applyWithPaperFormHeading,
    pageParams: {
      isRegistration: true
    }
  });
};
