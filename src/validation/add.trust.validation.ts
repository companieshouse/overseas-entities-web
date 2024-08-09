import { Request } from "express";
import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { hasNoBoAssignableToTrust } from "../utils/trusts";
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { checkRelevantPeriod } from "../utils/relevant.period";
import { isActiveFeature } from "../utils/feature.flag";
import { FEATURE_FLAG_ENABLE_RELEVANT_PERIOD } from "../config";

const isAddTrustToBeValidated = (req: Request): boolean => {
  const appData: ApplicationData = getApplicationData(req.session);
  const isUpdateOrRemoveJourney: boolean = !!appData.entity_number;

  if (!isUpdateOrRemoveJourney || !hasNoBoAssignableToTrust(appData)) {
    return true;
  }

  const isRelevantPeriod = checkRelevantPeriod(appData);
  const isRelevantPeriodFeatureEnabled = isActiveFeature(FEATURE_FLAG_ENABLE_RELEVANT_PERIOD);

  if (isRelevantPeriodFeatureEnabled && isRelevantPeriod) {
    return true;
  }

  return false;
};

export const addTrustValidations = [
  body("addTrust")
    .if((value, { req }) => isAddTrustToBeValidated(req))
    .notEmpty().withMessage(ErrorMessages.ADD_TRUST),
];
