import { Request, Response } from "express";

import { logger } from "../utils/logger";
import { ACCESSIBILITY_STATEMENT_PAGE } from "../config";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${ACCESSIBILITY_STATEMENT_PAGE}`);

  return res.render(ACCESSIBILITY_STATEMENT_PAGE, {
    templateName: ACCESSIBILITY_STATEMENT_PAGE
  });
};
