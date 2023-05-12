import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";

export const get = (req: Request, resp: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  resp.render("", {

  });
};

export const post = (req: Request, resp: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    resp.redirect("");
  } catch (error){
    next(error);
  }
};
