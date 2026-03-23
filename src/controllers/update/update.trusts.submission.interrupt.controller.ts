import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getRedirectUrl } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(config.UPDATE_TRUSTS_SUBMISSION_INTERRUPT_PAGE, {
      templateName: config.UPDATE_TRUSTS_SUBMISSION_INTERRUPT_PAGE,
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL,
    }));
  } catch (error) {
    next(error);
  }
};
