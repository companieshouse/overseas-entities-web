import * as config from "../config";
import { Request, Response } from "express";

export const get = (req: Request, res: Response) => {
  return res.render(config.USE_PAPER_PAGE, {
    backLinkUrl: config.SECURE_REGISTER_FILTER_URL
  });
};
