import { Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);
  return res.render(config.MANAGING_OFFICER_CORPORATE_PAGE);
};
