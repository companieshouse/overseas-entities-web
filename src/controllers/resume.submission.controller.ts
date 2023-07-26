import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { getResumePage } from "./shared/common.resume.submission.controller";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getResumePage(req, res, next, true, config.SOLD_LAND_FILTER_URL);
};
