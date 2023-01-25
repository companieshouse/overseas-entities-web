import * as config from "../../config";
import { Request, Response } from "express";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const applyWithPaperFormHeading: string = "You'll need to file an update using the paper form (NOT LIVE)";
  return res.render(config.USE_PAPER_PAGE, {
    backLinkUrl: config.SECURE_UPDATE_FILTER_URL,
    templateName: config.USE_PAPER_PAGE,
    applyWithPaperFormHeading
  });
};
