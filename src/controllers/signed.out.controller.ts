import { Request, Response } from "express";
import { SIGNED_OUT_PAGE, STARTING_NEW_URL } from "../config";

export const get = (req: Request, res: Response) => {
  res.render(SIGNED_OUT_PAGE, {
    signInUrl: `/signin?return_to=${STARTING_NEW_URL}`
  });
};
