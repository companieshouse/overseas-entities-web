import { Request } from "express";
import { ValidationError } from "express-validator";

import * as config from '../config';
import { ErrorMessages } from "./error.messages";
import { hasNoBoAssignableToTrust } from "../utils/trusts";
import { ApplicationData } from "../model";
import { checkRelevantPeriod } from "../utils/relevant.period";
import { isActiveFeature } from "../utils/feature.flag";

export const isAddTrustToBeValidated = (appData: ApplicationData, req: Request): ValidationError[] => {
  const errors: ValidationError[] = [];
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
  const isRelevantPeriodFeatureEnabled = isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD);

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
