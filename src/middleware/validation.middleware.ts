import { NextFunction, Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";

import { logger } from '../utils/logger';
import * as config from "../config";
import { NAVIGATION } from "../utils/navigation";
import { getBeneficialOwnerList } from "../utils/trusts";
import { isActiveFeature } from "../utils/feature.flag";
import { ApplicationData } from "../model/application.model";

import { EntityNameKey, EntityNumberKey, ID } from "../model/data.types.model";
import { fetchApplicationData, prepareData } from "../utils/application.data";

import {
  getUrlWithParamsToPath,
  isRegistrationJourney,
  isRemoveJourney,
} from "../utils/url";

import {
  beneficialOwnersTypeSubmission,
  checkNoChangeReviewStatement,
  checkNoChangeStatementSubmission,
  filingPeriodCeasedDateValidations,
  filingPeriodResignedDateValidations,
  filingPeriodStartDateValidations,
} from "../validation/async/validation-middleware";

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

export const checkValidations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {

    const errorList = validationResult(req);
    const customErrors = await getValidationErrors(req);

    if (!errorList.isEmpty() || customErrors.length > 0) {
      const errorListArray = !errorList.isEmpty() ? errorList.array() : [];
      const errors = formatValidationError([...errorListArray, ...customErrors]);

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

      const routePath = req.route.path.includes(config.DYNAMIC_SUB_PATH) ? req.route.path.replace(config.DYNAMIC_SUB_PATH, "") : req.route.path;

      // need to pass the id req param back into the page if present in the url in order to show the remove button again
      // when changing BO or MO data after failing validation. If not present, undefined will be passed in, which is fine as those pages
      // that don't use id will just ignore it.
      const id = req.params[ID];
      const isRegistration = isRegistrationJourney(req);
      const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
      let entityName = req.body[EntityNameKey];

      if (req.body[EntityNameKey] === undefined) {
        entityName = appData?.[EntityNameKey];
      }
      const entityNumber = appData?.[EntityNumberKey];
      const relevantPeriod = req.query["relevant-period"] === "true" || req.body["relevant_period"] === "true";

      // The journey property may already be part of the page form data/body so get it from there and override it if we are on a remove journey
      // Then when we pass it back into the template, make sure it is below/after the req.body fields so it overrides the req.body value
      let journey = req.body["journey"];
      const isRemove: boolean = await isRemoveJourney(req);

      if (isRemove) {
        journey = config.JourneyType.remove;
      }

      const noChangeFlag = appData?.update?.no_change;
      const FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC = isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC);

      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        // This is for the REDIS removal work, all BO / MO pages need the activeSubmissionBasePath passed into the template
        // and we also need to pass the feature flag as true so the template constructs the correct urls.
        return res.render(NAVIGATION[routePath].currentPage, {
          backLinkUrl: await NAVIGATION[routePath].previousPage(appData, req),
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
          activeSubmissionBasePath: getUrlWithParamsToPath(config.ACTIVE_SUBMISSION_BASE_PATH, req),
          pageParams: {
            noChangeFlag
          },
          FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        });
      }

      return res.render(NAVIGATION[routePath].currentPage, {
        backLinkUrl: await NAVIGATION[routePath].previousPage(appData, req),
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
        pageParams: {
          noChangeFlag
        },
        FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      });
    }

    return next();

  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};

export const checkTrustValidations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {

    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());
      const routePath = req.route.path;
      const isRegistration = isRegistrationJourney(req);
      const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

      return res.render(NAVIGATION[routePath].currentPage, {
        backLinkUrl: await NAVIGATION[routePath].previousPage(appData),
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
};

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

// Get validation errors that depend on an asynchronous request
const getValidationErrors = async (req: Request): Promise<ValidationError[]> => {
  const beneficialOwnersTypeErrors = await beneficialOwnersTypeSubmission(req);
  const filingPeriodStartDateErrors = await filingPeriodStartDateValidations(req);
  const filingPeriodCeasedDateErrors = await filingPeriodCeasedDateValidations(req);
  const filingPeriodResignedDateErrors = await filingPeriodResignedDateValidations(req);
  const checkNoChangeReviewStatementErrors = await checkNoChangeReviewStatement(req);
  const checkNoChangeStatementSubmissionErrors = await checkNoChangeStatementSubmission(req);

  return [
    ...beneficialOwnersTypeErrors,
    ...filingPeriodStartDateErrors,
    ...filingPeriodCeasedDateErrors,
    ...filingPeriodResignedDateErrors,
    ...checkNoChangeReviewStatementErrors,
    ...checkNoChangeStatementSubmissionErrors
  ];
};
