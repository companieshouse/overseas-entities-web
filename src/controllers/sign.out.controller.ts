import { Request, Response } from "express";

import { deleteApplicationData } from "../utils/application.data";
import { SIGN_OUT_PAGE, SOLD_LAND_FILTER_URL } from "../config";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${SIGN_OUT_PAGE}`);
  // create a new method to delete the entire session not just extra data
  deleteApplicationData(req.session);
  return res.render( SIGN_OUT_PAGE, {
    templateName: SIGN_OUT_PAGE
  });
};


export const post = (req: Request, res: Response) => {
  logger.infoRequest(req, 'User has been sign out, redirecting to sign in page, status_code=302');
  return res.redirect(`/signin?return_to=${SOLD_LAND_FILTER_URL}`);
};
