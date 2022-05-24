import { Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { deleteApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET BEFORE_YOU_START_PAGE`);

  deleteApplicationData(req.session);
  return res.render(config.INTERRUPT_CARD_PAGE);
};

export const post = (_req: Request, res: Response) => {
  return res.redirect(config.PRESENTER_URL);
};
