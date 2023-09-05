import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { PAYMENT_FAILED_PAGE } from "../config";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${PAYMENT_FAILED_PAGE}`);

  return res.render(PAYMENT_FAILED_PAGE, {
    templateName: PAYMENT_FAILED_PAGE,
    isUpdate: false
  });
};
