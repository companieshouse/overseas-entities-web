import { NextFunction, Request, Response } from "express";

import * as config from "../../config";

import { getResumePage } from "../shared/common.resume.submission.controller";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getResumePage(req, res, next, config.SECURE_UPDATE_FILTER_URL);
};
