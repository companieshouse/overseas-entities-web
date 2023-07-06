import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE, {
      backLinkUrl: config.UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL,
      templateName: config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.redirect(config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);
  } catch (error) {
    next(error);
  }
};
