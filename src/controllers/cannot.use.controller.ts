import * as config from "../config";
import { Request, Response } from "express";

export const get = (req: Request, res: Response) => {
  return res.render(config.CANNOT_USE_PAGE, {
    backLinkUrl: config.SOLD_LAND_FILTER_URL
  });
};
