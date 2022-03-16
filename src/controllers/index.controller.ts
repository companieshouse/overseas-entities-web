import { Request, Response } from "express";

import * as config from "../config";

export const startController = (req: Request, res: Response) => {
  return res.render(config.LANDING_PAGE);
};
