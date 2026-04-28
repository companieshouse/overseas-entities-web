import { Request } from 'express';
import { ErrorMessages } from './error.messages';
import { ValidationError } from 'express-validator';
import { ApplicationData } from 'model';
import { hasNoBoAssignableToTrust } from '../utils/trusts';

export const checkTrustStillInvolved = (appData: ApplicationData, req): ValidationError[] => {
  const errors: ValidationError[] = [];
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
  const errors: ValidationError[] = [];
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
  const errors: ValidationError[] = [];
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
