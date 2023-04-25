import { NextFunction, Request, Response } from "express";

import * as config from "../../config";

import { isActiveFeature } from "../../utils/feature.flag";
import { getResumePage } from "../shared/common.resume.submission.controller";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getResumePage(req, res, next, isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME), config.SECURE_UPDATE_FILTER_URL);
};
