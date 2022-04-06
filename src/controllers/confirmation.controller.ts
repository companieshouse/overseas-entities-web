import { Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.CONFIRMATION_PAGE}`);
  return res.render(config.CONFIRMATION_PAGE, {
    referenceNumber: "TBC123"
  });
};
