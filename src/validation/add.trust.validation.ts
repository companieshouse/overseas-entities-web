import { Request } from "express";
import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { hasNoBoAssignableToTrust } from "../utils/trusts";
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";

const isAddTrustToBeValidated = (req: Request): boolean => {
  const appData: ApplicationData = getApplicationData(req.session);
  const isUpdateOrRemove: boolean = !!appData.entity_number;
  return !isUpdateOrRemove || !hasNoBoAssignableToTrust(appData);
};

export const addTrustValidations = [
  body("addTrust")
    .if((value, { req }) => isAddTrustToBeValidated(req))
    .notEmpty().withMessage(ErrorMessages.ADD_TRUST),
];
