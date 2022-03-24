import { Request, Response } from "express";
import * as config from "../config";


export const get = (req: Request, res: Response) => {
  res.render(config.BENEFIFICAL_OWNER_CORPORATE_PAGE);
};
