import { Request, Response } from "express";
import { SIGNED_OUT_PAGE } from "../config";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  res.render(SIGNED_OUT_PAGE, {
    signInUrl: `${config.STARTING_NEW_PAGE}`
  });
};
