import { Request } from "express";
import { ValidationError } from "express-validator";

import * as config from '../config';
import { ErrorMessages } from "./error.messages";
import { hasNoBoAssignableToTrust } from "../utils/trusts";
import { ApplicationData } from "../model";
import { checkRelevantPeriod } from "../utils/relevant.period";
import { isActiveFeature } from "../utils/feature.flag";
import { FEATURE_FLAG_ENABLE_RELEVANT_PERIOD } from "../config";
import isAllowedUrls from "./async/isAllowedUrls";

export const isAddTrustToBeValidated = (appData: ApplicationData, req: Request): ValidationError[] => {

  const allowedUrls = [
    [config.TRUST_ENTRY_URL, config.ADD_TRUST_URL],
    [config.TRUST_ENTRY_WITH_PARAMS_URL, config.ADD_TRUST_URL],
    [config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL]
  ];

  const allowed: boolean = isAllowedUrls(allowedUrls, req);

  const errors: ValidationError[] = [];

  if (!allowed) {
    return errors;
  }

  const isUpdateOrRemoveJourney: boolean = !!appData.entity_number;

  if (!isUpdateOrRemoveJourney || !hasNoBoAssignableToTrust(appData)) {
    if (!req.body["addTrust"]) {
      return [{
        value: '',
        msg: ErrorMessages.ADD_TRUST,
        param: "addTrust",
        location: 'body',
      }];
    }
  }

  const isRelevantPeriod = checkRelevantPeriod(appData);
  const isRelevantPeriodFeatureEnabled = isActiveFeature(FEATURE_FLAG_ENABLE_RELEVANT_PERIOD);

  if (isRelevantPeriodFeatureEnabled && isRelevantPeriod) {
    if (!req.body["addTrust"]) {
      return [{
        value: '',
        msg: ErrorMessages.ADD_TRUST,
        param: "addTrust",
        location: 'body',
      }];
    }
  }

  return errors;
};
