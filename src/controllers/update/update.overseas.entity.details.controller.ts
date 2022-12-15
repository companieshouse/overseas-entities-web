import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";


export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(config.UPDATE_OVERSEAS_ENTITY_DETAILS_PAGE, {
      templateName: config.UPDATE_OVERSEAS_ENTITY_DETAILS_PAGE,
    });
  }  catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
