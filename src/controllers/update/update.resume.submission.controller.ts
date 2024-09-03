import { NextFunction, Request, Response } from "express";

import * as config from "../../config";

import { getResumePage } from "../shared/common.resume.submission.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getResumePage(req, res, next, config.SECURE_UPDATE_FILTER_URL);
};
