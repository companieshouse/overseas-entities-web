import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { AnyTrustsInvolvedKey } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    return res.render(config.UPDATE_ANY_TRUSTS_INVOLVED_PAGE, {
      backLinkUrl: config.SECURE_UPDATE_FILTER_URL,
      templateName: config.UPDATE_ANY_TRUSTS_INVOLVED_PAGE
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    if (req.body[AnyTrustsInvolvedKey] === "1") {
      return res.redirect(config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL);
    } else {
      return res.redirect(config.UPDATE_INTERRUPT_CARD_URL);
    }
  } catch (error) {
    next(error);
  }
};
