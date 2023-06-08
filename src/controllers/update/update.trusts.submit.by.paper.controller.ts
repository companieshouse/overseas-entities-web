import { logger } from "../../utils/logger";
import * as config from "../../config";
import { Request, Response } from "express";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  return res.render(config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE, {
    backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
    templateName: config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE
  });
};
