import { NextFunction, Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";

import { getApplicationData, prepareData } from "../utils/application.data";
import { NAVIGATION } from "../utils/navigation";
import {
  DateOfBirthKey,
  StartDateKey,
  DateOfBirthKeys,
  StartDateKeys,
  IdentityDateKey,
  IdentityDateKeys,
} from "../model/date.model";

import { logger } from '../utils/logger';
import { ID } from "../model/data.types.model";
import { ApplicationData } from "../model/application.model";
import { getBeneficialOwnerList } from "../utils/trusts";

export function checkValidations(req: Request, res: Response, next: NextFunction) {
  try {
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());

      // Bypass the direct use of variables with dashes that
      // govukDateInput adds for day, month and year field
      const dates = {
        [DateOfBirthKey]: prepareData(req.body, DateOfBirthKeys),
        [StartDateKey]: prepareData(req.body, StartDateKeys),
        [IdentityDateKey]: prepareData(req.body, IdentityDateKeys)
      };

      const routePath = req.route.path;

      // need to pass the id req param back into the page if present in the url in order to show the remove button again
      // when changing BO or MO data after failing validation. If not present, undefined will be passed in, which is fine as those pages
      // that don't use id will just ignore it.
      const id = req.params[ID];
      const appData: ApplicationData = getApplicationData(req.session);

      return res.render(NAVIGATION[routePath].currentPage, {
        backLinkUrl: NAVIGATION[routePath].previousPage(appData),
        id,
        appData,
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

export function checkTrustValidations(req: Request, res: Response, next: NextFunction) {
  try {
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());
      const routePath = req.route.path;
      const appData: ApplicationData = getApplicationData(req.session);

      return res.render(NAVIGATION[routePath].currentPage, {
        backLinkUrl: NAVIGATION[routePath].previousPage(appData),
        ...req.body,
        beneficialOwners: getBeneficialOwnerList(appData),
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
