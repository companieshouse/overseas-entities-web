import { Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";


export const get = (req: Request, res: Response) => {
  logger.debug(`GET BENEFICIAL_OWNER_OTHER_PAGE`);
  res.render(config.BENEFICIAL_OWNER_OTHER_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE
  });
};
