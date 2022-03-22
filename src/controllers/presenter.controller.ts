import { Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.info(`GET PRESENTER_PAGE`);
  return res.render(config.PRESENTER_PAGE, {
    backLinkUrl: config.LANDING_URL
  });
};
