import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { UPDATE_PAYMENT_FAILED_PAGE } from "../../config";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${UPDATE_PAYMENT_FAILED_PAGE}`);

  return res.render(UPDATE_PAYMENT_FAILED_PAGE, {
    templateName: UPDATE_PAYMENT_FAILED_PAGE
  });
};
