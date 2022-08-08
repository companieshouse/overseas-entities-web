import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue, checkTrustFields } from "./custom.validation";

import { ErrorMessages } from "./error.messages";

export const trustInformation = [
  body("beneficialOwners").custom((value, { req }) =>
    checkAtLeastOneFieldHasValue(ErrorMessages.TRUST_BO_CHECKBOX, req.body.beneficialOwners)),

  body("trusts")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_DATA_EMPTY)
    .custom((value, { req }) =>
      checkTrustFields(req.body.trusts))
];
