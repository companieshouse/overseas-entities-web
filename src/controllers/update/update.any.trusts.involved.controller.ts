import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getRedirectUrl } from "../../utils/url";
import { AnyTrustsInvolvedKey } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    return res.render(config.UPDATE_ANY_TRUSTS_INVOLVED_PAGE, {
      templateName: config.UPDATE_ANY_TRUSTS_INVOLVED_PAGE,
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.SECURE_UPDATE_FILTER_URL,
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    if (req.body[AnyTrustsInvolvedKey] === "1") {
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL,
      }));
    } else {
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_INTERRUPT_CARD_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_INTERRUPT_CARD_URL,
      }));
    }
  } catch (error) {
    next(error);
  }
};
