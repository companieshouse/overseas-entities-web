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
  CeasedDateKey,
  CeasedDateKeys,
  FilingDateKey,
  FilingDateKeys,
  ResignedOnDateKeys,
  ResignedOnDateKey
} from "../model/date.model";

import { logger } from '../utils/logger';
import { EntityNameKey, EntityNumberKey, ID } from "../model/data.types.model";
import { ApplicationData } from "../model/application.model";
import { getBeneficialOwnerList } from "../utils/trusts";
import { isActiveFeature } from "../utils/feature.flag";
import * as config from "../config";
import { getUrlWithParamsToPath, isRemoveJourney } from "../utils/url";

export async function checkValidations(req: Request, res: Response, next: NextFunction) {
  try {
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());

      // Bypass the direct use of variables with dashes that
      // govukDateInput adds for day, month and year field
      const dates = {
        [DateOfBirthKey]: prepareData(req.body, DateOfBirthKeys),
        [StartDateKey]: prepareData(req.body, StartDateKeys),
        [IdentityDateKey]: prepareData(req.body, IdentityDateKeys),
        [CeasedDateKey]: prepareData(req.body, CeasedDateKeys),
        [FilingDateKey]: prepareData(req.body, FilingDateKeys),
        [ResignedOnDateKey]: prepareData(req.body, ResignedOnDateKeys),
      };

      const routePath = req.route.path;

      // need to pass the id req param back into the page if present in the url in order to show the remove button again
      // when changing BO or MO data after failing validation. If not present, undefined will be passed in, which is fine as those pages
      // that don't use id will just ignore it.
      const id = req.params[ID];
      const appData: ApplicationData = await getApplicationData(req.session);
      let entityName = req.body[EntityNameKey];

      if (req.body[EntityNameKey] === undefined) {
        entityName = appData?.[EntityNameKey];
      }
      const entityNumber = appData?.[EntityNumberKey];
      const relevantPeriod = req.query["relevant-period"] === "true";

      // The journey property may already be part of the page form data/body so get it from there and override it if we are on a remove journey
      // Then when we pass it back into the template, make sure it is below/after the req.body fields so it overrides the req.body value
      let journey = req.body["journey"];
      if (await isRemoveJourney(req)){
        journey = config.JourneyType.remove;
      }

      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        // This is for the REDIS removal work, all BO / MO pages need the activeSubmissionBasePath passed into the template
        // and we also need to pass the feature flag as true so the template constructs the correct urls.
        return res.render(NAVIGATION[routePath].currentPage, {
          backLinkUrl: NAVIGATION[routePath].previousPage(appData, req),
          templateName: NAVIGATION[routePath].currentPage,
          id,
          entityName,
          entityNumber,
          ...appData,
          ...req.body,
          ...dates,
          journey,
          relevant_period: relevantPeriod,
          errors,
          FEATURE_FLAG_ENABLE_REDIS_REMOVAL: true,
          activeSubmissionBasePath: getUrlWithParamsToPath(config.ACTIVE_SUBMISSION_BASE_PATH, req)
        });
      }

      return res.render(NAVIGATION[routePath].currentPage, {
        backLinkUrl: NAVIGATION[routePath].previousPage(appData, req),
        templateName: NAVIGATION[routePath].currentPage,
        id,
        entityName,
        entityNumber,
        ...appData,
        ...req.body,
        ...dates,
        journey,
        relevant_period: relevantPeriod,
        errors
      });
    }

    return next();
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
}

export async function checkTrustValidations(req: Request, res: Response, next: NextFunction) {
  try {
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());
      const routePath = req.route.path;
      const appData: ApplicationData = await getApplicationData(req.session);

      return res.render(NAVIGATION[routePath].currentPage, {
        backLinkUrl: NAVIGATION[routePath].previousPage(appData),
        templateName: NAVIGATION[routePath].currentPage,
        ...req.body,
        beneficialOwners: getBeneficialOwnerList(appData),
        relevant_period: req.query["relevant-period"] === "true",
        trusts_input: req.body.trusts?.toString(),
        errors
      });
    }

    return next();
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
}

export type FormattedValidationErrors = {
  [key: string]: {
    text: string;
  },
} & {
  errorList: {
    href: string,
    text: string,
  }[],
};

export function formatValidationError(errorList: ValidationError[]): FormattedValidationErrors {
  const errors = { errorList: [] } as any;
  errorList.forEach( e => {
    errors.errorList.push({ href: `#${e.param}`, text: e.msg });
    errors[e.param] = { text: e.msg };
  });
  return errors;
}
