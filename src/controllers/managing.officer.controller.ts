import { Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.info(`GET MANAGING_OFFICER_PAGE`);
  return res.render(config.MANAGING_OFFICER_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_OTHER_PAGE
  });
};
