import { Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET LANDING_PAGE`);
  return res.render(config.LANDING_PAGE);
};
