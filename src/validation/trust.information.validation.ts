import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue, checkMandatoryTrustFields } from "./custom.validation";

import { ErrorMessages } from "./error.messages";

export const trustInformation = [
  body("trusts").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_DATA_EMPTY),
  body("beneficialOwners").custom((value, { req }) =>
    checkAtLeastOneFieldHasValue(ErrorMessages.TRUST_BO_CHECKBOX, req.body.beneficialOwners)),
  body("trusts").custom((value, { req }) =>
    checkMandatoryTrustFields(ErrorMessages.TRUST_NAME, ErrorMessages.TRUST_CREATION_DATE, req.body.trusts))
];
