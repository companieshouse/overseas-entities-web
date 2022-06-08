import { NextFunction, Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";

import { getApplicationData, prepareData } from "../utils/application.data";
import { NAVIGATION } from "../utils/navigation";
import { DateOfBirthKey, StartDateKey, DateOfBirthKeys, StartDateKeys } from "../model/date.model";

import { logger } from '../utils/logger';

export function checkValidations(req: Request, res: Response, next: NextFunction) {
  try {
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());

      // Bypass the direct use of variables with dashes that
      // govukDateInput adds for day, month and year field
      const dates = {
        [DateOfBirthKey]: prepareData(req.body, DateOfBirthKeys),
        [StartDateKey]: prepareData(req.body, StartDateKeys)
      };

      const routePath = req.route.path;
      return res.render(NAVIGATION[routePath].currentPage, {
        backLinkUrl: NAVIGATION[routePath].previousPage,
        ...getApplicationData(req.session),
        ...req.body,
        ...dates,
        errors
      });
    }

    return next();
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
}


function formatValidationError(errorList: ValidationError[]) {
  const errors = { errorList: [] } as any;
  errorList.forEach( e => {
    errors.errorList.push({ href: `#${e.param}`, text: e.msg });
    errors[e.param] = { text: e.msg };
  });
  return errors;
}
