import { Request } from 'express';
import { ValidationError } from "express-validator";

import * as config from '../../config';
import { ApplicationData } from "model";
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { ErrorMessages } from '../../validation/error.messages';
import { checkCeasedDateOnOrAfterDateOfBirth, checkCeasedDateOnOrAfterTrustCreationDate, checkIndividualCeasedDateOnOrAfterInterestedPersonStartDate, checkLegalEntityCeasedDateOnOrAfterInterestedPersonStartDate } from '../../validation/fields/date.validation';
import { hasNoBoAssignableToTrust } from '../../utils/trusts';

export const checkTrustStillInvolved = (appData: ApplicationData, req): ValidationError[] => {
  const allowedUrls = [
    [config.TRUST_DETAILS_URL],
    [config.TRUST_ENTRY_WITH_PARAMS_URL],
    [config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL],

    [config.UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL]
  ];

  const allowed: boolean = isAllowed(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  const isUpdateOrRemove: boolean = !!appData.entity_number;

  if (!hasNoBoAssignableToTrust(appData) && isUpdateOrRemove && !req.body["stillInvolved"]) {
    errors.push({
      value: '',
      msg: ErrorMessages.TRUST_STILL_INVOLVED,
      param: 'stillInvolved',
      location: 'body',
    });
  }

  return errors;
};

export const checkTrustLegalEntityBeneficialOwnerStillInvolved = (appData: ApplicationData, req): ValidationError[] => {
  const allowedUrls = [
    [config.TRUST_ENTRY_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL],
    [config.TRUST_ENTRY_WITH_PARAMS_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL + config.TRUSTEE_ID + '?']
  ];

  const allowed: boolean = isAllowed(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  if (appData?.entity_number && !req.body["stillInvolved"]) {
    errors.push({
      value: '',
      msg: ErrorMessages.TRUSTEE_STILL_INVOLVED,
      param: 'stillInvolved',
      location: 'body',
    });
  }

  return errors;
};

export const checkTrustIndividualBeneficialOwnerStillInvolved = (appData: ApplicationData, req: Request): ValidationError[] => {
  const allowedUrls = [
    [config.TRUST_ENTRY_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL],
    [config.TRUST_ENTRY_WITH_PARAMS_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowed(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  if (appData?.entity_number && !req.body["stillInvolved"]) {
    errors.push({
      value: '',
      msg: ErrorMessages.TRUSTEE_STILL_INVOLVED,
      param: 'stillInvolved',
      location: 'body',
    });
  }

  return errors;
};

export const checkTrustIndividualCeasedDate = async (appData: ApplicationData, req: Request): Promise<ValidationError[]> => {
  const allowedUrls = [
    [config.TRUST_ENTRY_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL],
    [config.TRUST_ENTRY_WITH_PARAMS_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowed(allowedUrls, req);

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
    [config.TRUST_ENTRY_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL],
    [config.TRUST_ENTRY_WITH_PARAMS_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowed(allowedUrls, req);

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

const isAllowed = (allowedUrls: string[][], req): boolean => {
  // Some tests don't use the controller but the function called by this one and don't have a url in the mockReq
  if (!req.url && process.env.JEST_WORKER_ID && process.env.NODE_ENV === 'development') {
    return true;
  }
  // end tests condition

  let allowed = false;
  for (const allowedUrl of allowedUrls) {
    if (allowedUrl.every(el => req.url.includes(el))) {
      allowed = true;
      break;
    }
  }
  return allowed;
};

