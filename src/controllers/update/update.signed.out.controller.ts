import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(config.UPDATE_SIGNED_OUT_PAGE, {
      templateName: config.UPDATE_SIGNED_OUT_PAGE,
      hideBanners: true
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
