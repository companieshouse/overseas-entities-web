import { Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";


export const get = (req: Request, res: Response) => {
  logger.info(`GET BENEFICIAL_OWNER_CORPORATE_PAGE`);
  res.render(config.BENEFICIAL_OWNER_OTHER_PAGE);
};
