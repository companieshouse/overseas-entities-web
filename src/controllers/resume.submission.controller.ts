import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";
import { getResumePage } from "./shared/common.resume.submission.controller";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const { transactionId, overseasEntityId } = req.params;
  const resumeUrl: string = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithTransactionIdAndSubmissionId(config.SOLD_LAND_FILTER_WITH_PARAMS_URL, transactionId, overseasEntityId)
    : config.SOLD_LAND_FILTER_URL;
  await getResumePage(req, res, next, resumeUrl);
};
