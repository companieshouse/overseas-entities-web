import { Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.info(`GET THE INDIVIDUAL BENEFICIAL OWNER PAGE`);
  return res.render(config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: config.LANDING_URL
  });
};
