import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { PAYMENT_FAILED_PAGE } from "../../config";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.render(PAYMENT_FAILED_PAGE, {
    templateName: PAYMENT_FAILED_PAGE,
    isUpdate: true
  });
};
