import { NextFunction, Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";
import { NAVIGATION } from "../utils/navigation";

export function checkValidations(req: Request, res: Response, next: NextFunction) {
  const errorList = validationResult(req);

  if (!errorList.isEmpty()) {
    const errors = formatValidationError(errorList.array());

    return res.render(NAVIGATION[req.path].currentPage, {
      backLinkUrl: NAVIGATION[req.path].previusPage,
      errors,
      ...req.body
    });
  }

  return next();
}


function formatValidationError(errorList: ValidationError[]) {
  const errors = { errorList: [] } as any;
  errorList.forEach( e => {
    errors.errorList.push({ href: `#${e.param}`, text: e.msg });
    errors[e.param] = { text: e.msg };
  });
  return errors;
}
