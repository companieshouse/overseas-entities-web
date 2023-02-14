import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const serviceLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.on("start", function() {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
  });
  next();
};
