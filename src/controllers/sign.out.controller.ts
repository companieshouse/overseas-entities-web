import { Request, Response } from "express";

import { deleteApplicationData } from "../utils/application.data";
import { SIGN_OUT_PAGE } from "../config";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${SIGN_OUT_PAGE}`);

  deleteApplicationData(req.session);
  req.session = undefined;

  return res.render( SIGN_OUT_PAGE, { templateName: SIGN_OUT_PAGE });
};
