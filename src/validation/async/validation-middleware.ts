import { Request } from 'express';
import { ValidationError } from 'express-validator';

import * as config from '../../config';
import { checkBeneficialOwnersSubmission } from "../../validation/custom.validation";

export const beneficialOwnersTypeSubmission = async (req: Request): Promise<ValidationError[]> => {
  const allowedUrls = [
    [config.REGISTER_AN_OVERSEAS_ENTITY_URL, config.BENEFICIAL_OWNER_TYPE_PAGE, config.SUBMIT_URL]
  ];

  const allowed: boolean = isAllowed(allowedUrls, req);

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
