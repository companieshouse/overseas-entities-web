/* eslint-disable require-await */
import { Request } from 'express';
import { ValidationError } from "express-validator";

import * as config from '../../config';
import { ApplicationData } from "model";
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { ErrorMessages } from '../../validation/error.messages';
import { checkCeasedDateOnOrAfterDateOfBirth, checkCeasedDateOnOrAfterTrustCreationDate, checkIndividualCeasedDateOnOrAfterInterestedPersonStartDate, checkLegalEntityCeasedDateOnOrAfterInterestedPersonStartDate, historicalBOEndDateContext, historicalBOStartDateContext } from '../../validation/fields/date.validation';
import { dateContext } from '../../validation/fields/helper/date.validation.helper';
import { checkDatePreviousToFilingDate } from '../../validation/custom.validation';
import isAllowedUrls from './isAllowedUrls';

export const checkTrustIndividualCeasedDate = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    const condition = appData?.entity_number ||
      req.body["stillInvolved"] === "0" ||
      req.body["ceasedDateDay"] ||
      req.body["ceasedDateMonth"] ||
      req.body["ceasedDateYear"];

    if (condition) {
      checkCeasedDateOnOrAfterDateOfBirth(req, ErrorMessages.DATE_BEFORE_BIRTH_DATE_CEASED_TRUSTEE);

      await checkCeasedDateOnOrAfterTrustCreationDate(req, ErrorMessages.DATE_BEFORE_TRUST_CREATION_DATE_CEASED_TRUSTEE);

      if (req.body["roleWithinTrust"] === RoleWithinTrustType.INTERESTED_PERSON
        && req.body["dateBecameIPDay"]
        && req.body["dateBecameIPMonth"]
        && req.body["dateBecameIPYear"]) {
        checkIndividualCeasedDateOnOrAfterInterestedPersonStartDate(req, ErrorMessages.DATE_BEFORE_INTERESTED_PERSON_START_DATE_CEASED_TRUSTEE);
      }

      return errors;
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: 'ceasedDate',
      location: 'body',
    });

    return errors;
  }
};

export const checkTrusteeLegalEntityCeasedDate = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    const condition = req.body["stillInvolved"] === "0" ||
      req.body["ceasedDateDay"] ||
      req.body["ceasedDateMonth"] ||
      req.body["ceasedDateYear"];

    if (condition) {
      await checkCeasedDateOnOrAfterTrustCreationDate(req, ErrorMessages.DATE_BEFORE_TRUST_CREATION_DATE_CEASED_TRUSTEE);

      if (req.body["roleWithinTrust"] === RoleWithinTrustType.INTERESTED_PERSON
        && req.body["interestedPersonStartDateDay"]
        && req.body["interestedPersonStartDateMonth"]
        && req.body["interestedPersonStartDateYear"]) {
        checkLegalEntityCeasedDateOnOrAfterInterestedPersonStartDate(req, ErrorMessages.DATE_BEFORE_INTERESTED_PERSON_START_DATE_CEASED_TRUSTEE);
      }

      return errors;
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: 'ceasedDate',
      location: 'body',
    });

    return errors;
  }
};

const is_date_within_filing_period_trusts = async (req: Request, trustDateContext: dateContext, error_message: string) => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL, config.TRUST_HISTORICAL_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_HISTORICAL_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  try {
    if (req.body[trustDateContext.dayInput.name]) {
      await checkDatePreviousToFilingDate(
        req,
        req.body[trustDateContext.dayInput.name], req.body[trustDateContext.monthInput.name], req.body[trustDateContext.yearInput.name],
        error_message
      );

      return errors;
    }

    return errors;
  } catch (error) {
    errors.push({
      value: '',
      msg: error.message,
      param: trustDateContext.dateInput.name,
      location: 'body',
    });

    return errors;
  }

};

export const filingPeriodTrustStartDateValidations = async (req: Request) => is_date_within_filing_period_trusts(req, historicalBOStartDateContext, ErrorMessages.START_DATE_BEFORE_FILING_DATE);

export const filingPeriodTrustCeaseDateValidations = async (req: Request) => is_date_within_filing_period_trusts(req, historicalBOEndDateContext, ErrorMessages.CEASED_DATE_BEFORE_FILING_DATE);

