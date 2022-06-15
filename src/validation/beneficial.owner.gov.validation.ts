import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { principal_address_beneficial_owner_validation, service_address_beneficial_owner_validation } from "./fields/address.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";

export const beneficialOwnerGov = [
  body("name")
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  ...principal_address_beneficial_owner_validation,
  ...service_address_beneficial_owner_validation,

  body("legal_form")
    .isLength({ max: 4000 }).withMessage(ErrorMessages.MAX_LEGAL_FORM_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS),
  body("law_governed")
    .isLength({ max: 4000 }).withMessage(ErrorMessages.MAX_LAW_GOVERNED_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS),

];
