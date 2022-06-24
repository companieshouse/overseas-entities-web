import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { deleteApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET LANDING_PAGE`);

    deleteApplicationData(req.session);
    return res.render(config.LANDING_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
