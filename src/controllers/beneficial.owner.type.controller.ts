import { Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";


export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);
  return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, { backLinkUrl: config.ENTITY_URL });
};

export const post = (req: Request, res: Response) => {
  logger.debug(`POST ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);
  return res.redirect("/next-page");
};
