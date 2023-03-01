import { Request, Response } from "express";
import { SIGNED_OUT_PAGE, STARTING_NEW_PAGE } from "../config";

export const get = (req: Request, res: Response) => {
  res.render(SIGNED_OUT_PAGE, {
    signInUrl: `${STARTING_NEW_PAGE}`
  });
};
