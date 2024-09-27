import { Request } from 'express';
import { ValidationError } from 'express-validator';

import { ApplicationData } from 'model';
import * as config from '../config';
import { hasNoBoAssignableToTrust } from '../utils/trusts';
import { ErrorMessages } from './error.messages';
import isAllowedUrls from './async/isAllowedUrls';

export const checkTrustStillInvolved = (appData: ApplicationData, req): ValidationError[] => {
  const allowedUrls = [
    [config.TRUST_DETAILS_URL],
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL],
    [config.UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL],

    [config.UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

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
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL + config.TRUSTEE_ID + '?']
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

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
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.TRUSTS_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL],
    [config.UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL],
    [config.UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, config.TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

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
