import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue } from "./custom.validation";

import { ErrorMessages } from "./error.messages";

export const trustInformation = [
  body("trusts").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_DATA_EMPTY),
  body("beneficialOwners").custom((value, { req }) =>
    checkAtLeastOneFieldHasValue(ErrorMessages.BO_CHECKBOX, req.body.beneficialOwners))
];
