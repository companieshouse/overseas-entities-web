import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { getResumePage } from "../shared/common.resume.submission.controller";
import { isActiveFeature } from "../../utils/feature.flag";
import { getUrlWithTransactionIdAndSubmissionId } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const { transactionId, overseasEntityId } = req.params;
  const resumeUrl: string = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithTransactionIdAndSubmissionId(config.SECURE_UPDATE_FILTER_WITH_PARAMS_URL, transactionId, overseasEntityId)
    : config.SECURE_UPDATE_FILTER_URL;
  await getResumePage(req, res, next, resumeUrl);
};
