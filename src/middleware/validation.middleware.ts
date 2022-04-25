import { NextFunction, Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";

import { logger } from "../utils/logger";

export function checkValidations(req: Request, res: Response, next: NextFunction) {
  const errorList = validationResult(req);

  logger.debug(`errorList: ${JSON.stringify(errorList, null, '\t')}`);
  if (!errorList.isEmpty()) {
    const errors = errorList.formatWith(errorFormatter);
    const template = req.path.split("/").pop() as string;

    logger.debug(`errors: ${JSON.stringify(errors, null, '\t')}`);
    return res.render(template, { ...req.body, errorList, errors });
  }

  return next();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorFormatter = ({ location, msg, param, value, nestedErrors }: ValidationError) => {
  return `[${param}]: ${msg}`;
};
