import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { CONFIRMATION_PAGE } from "../config";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${CONFIRMATION_PAGE}`);
  return res.render(CONFIRMATION_PAGE, {
    referenceNumber: "TBC123"
  });
};
