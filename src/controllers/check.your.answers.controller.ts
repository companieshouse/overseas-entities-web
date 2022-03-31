import { Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);
  return res.render(config.CHECK_YOUR_ANSWERS_PAGE, {
    backLinkUrl: config.MANAGING_OFFICER_CORPORATE_URL
  });
};


