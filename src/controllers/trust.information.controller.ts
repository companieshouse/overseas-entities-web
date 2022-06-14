import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
    logger.debugRequest(req, `GET ${config.TRUST_INFO_PAGE}`);
  
    return res.render(config.TRUST_INFO_PAGE, {
        backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE,
        templateName: config.TRUST_INFO_PAGE
        //...appData
    });
  };

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `POST ${config.TRUST_INFO_PAGE}`);

  return res.redirect("TODO");
};
