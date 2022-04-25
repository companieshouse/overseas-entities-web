import { Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { deleteApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response) => {
  logger.infoRequest(req, `GET LANDING_PAGE`);

  deleteApplicationData(req.session);
  return res.render(config.LANDING_PAGE);
};
