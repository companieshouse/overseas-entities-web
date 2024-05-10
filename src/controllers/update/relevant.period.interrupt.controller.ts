import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(config.RELEVANT_PERIOD_INTERRUPT_PAGE, {
      backLinkUrl: "",
      templateName: config.RELEVANT_PERIOD_INTERRUPT_PAGE,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
