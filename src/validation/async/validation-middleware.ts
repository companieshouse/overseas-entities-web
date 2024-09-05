import { Request } from 'express';
import { ValidationError } from 'express-validator';

import * as config from '../../config';
import { checkBeneficialOwnersSubmission, checkDatePreviousToFilingDate } from "../../validation/custom.validation";
import { ErrorMessages } from '../../validation/error.messages';
import isAllowedUrls from './isAllowedUrls';
import { isRemoveJourney } from '../../utils/url';

export const beneficialOwnersTypeSubmission = async (req: Request): Promise<ValidationError[]> => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.BENEFICIAL_OWNER_TYPE_PAGE, config.SUBMIT_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    await checkBeneficialOwnersSubmission(req);

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: 'beneficial_owner_type',
      location: 'body',
    });

    return errors;
  }
};

const checkAgainstFilingDate = async (req: Request, date_field_id: string, error_message: string) =>
  await checkDatePreviousToFilingDate(
    req,
    req.body[date_field_id + "-day"], req.body[date_field_id + "-month"], req.body[date_field_id + "-year"],
    error_message
  );

const is_date_within_filing_period = async (req: Request, date_field_id: string, error_message: string) => {
  const allowedUrls = [
    [config.UPDATE_BENEFICIAL_OWNER_GOV_URL],
    [config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL],
    [config.UPDATE_BENEFICIAL_OWNER_OTHER_URL],
    [config.UPDATE_MANAGING_OFFICER_CORPORATE_URL],
    [config.UPDATE_MANAGING_OFFICER_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    if (req.body[date_field_id]){
      await checkAgainstFilingDate(req, date_field_id, error_message);

      return errors;
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: date_field_id,
      location: 'body',
    });

    return errors;
  }

};

export const filingPeriodStartDateValidations = async (req: Request) => await is_date_within_filing_period(req, "start_date", ErrorMessages.START_DATE_BEFORE_FILING_DATE);

const is_end_date_within_filing_period = async (req: Request, allowedUrls: Array<string[]>, date_field_id: string, radio_button_id: string, error_message: string) => {

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    if (req.body[date_field_id] && req.body[radio_button_id] === '0') {
      await checkAgainstFilingDate(req, date_field_id, error_message);

      return errors;
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: date_field_id,
      location: 'body',
    });

    return errors;
  }
};

export const filingPeriodCeasedDateValidations = async (req: Request) => {
  const allowedUrls = [
    [config.UPDATE_BENEFICIAL_OWNER_GOV_URL],
    [config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL],
    [config.UPDATE_BENEFICIAL_OWNER_OTHER_URL],
    [config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL],
    [config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL],
    [config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL]
  ];

  return await is_end_date_within_filing_period(req, allowedUrls, "ceased_date", "is_still_bo", ErrorMessages.CEASED_DATE_BEFORE_FILING_DATE);
};

export const filingPeriodResignedDateValidations = async (req: Request) => {
  const allowedUrls = [
    [config.UPDATE_MANAGING_OFFICER_CORPORATE_URL],
    [config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL],
    [config.UPDATE_MANAGING_OFFICER_URL],
    [config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL]
  ];

  return await is_end_date_within_filing_period(req, allowedUrls, "resigned_on", "is_still_mo", ErrorMessages.RESIGNED_ON_BEFORE_FILING_DATE);
};

export const checkNoChangeReviewStatement = async (req) => {
  const allowedUrls = [
    [config.UPDATE_REVIEW_STATEMENT_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    if (req.body["no_change_review_statement"] === undefined) {
      const isRemove: boolean = await isRemoveJourney(req);

      if (isRemove) {
        throw new Error(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_CHANGES_REMOVE_STATEMENT);
      }
      throw new Error(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_CHANGES_UPDATE_STATEMENT);
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: "no_change_review_statement",
      location: 'body',
    });

    return errors;
  }
};

export const checkNoChangeStatementSubmission = async (req) => {
  const allowedUrls = [
    [config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    if (req.body["no_change"] === undefined) {
      const isRemove: boolean = await isRemoveJourney(req);

      if (await isRemove) {
        throw new Error(ErrorMessages.SELECT_REMOVE_DO_YOU_WANT_TO_MAKE_OE_CHANGE);
      }
      throw new Error(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_OE_CHANGE);
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: "no_change",
      location: 'body',
    });

    return errors;
  }
};
