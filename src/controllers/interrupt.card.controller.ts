import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { deleteApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.INTERRUPT_CARD_PAGE}`);

    deleteApplicationData(req.session);
    return res.render(config.INTERRUPT_CARD_PAGE, {
      backLinkUrl: config.SECURE_REGISTER_FILTER_URL,
      templateName: config.INTERRUPT_CARD_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
