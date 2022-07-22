import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue, checkTrustData } from "./custom.validation";

import { ErrorMessages } from "./error.messages";

export const trustInformation = [
  body("beneficialOwners").custom((value, { req }) =>
    checkAtLeastOneFieldHasValue(ErrorMessages.TRUST_BO_CHECKBOX, req.body.beneficialOwners)),

  body("trusts")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_DATA_EMPTY)
    .custom((value, { req }) =>
      checkTrustData(ErrorMessages.TRUST_NAME, ErrorMessages.TRUST_CREATION_DATE, ErrorMessages.TRUST_INVALID_JSON, req.body.trusts))
];
