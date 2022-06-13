import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { usual_residential_service_address_max_validations, usual_residential_address_max_validations } from "./fields/address.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";

export const beneficialOwnerIndividual = [
  body("first_name").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH).matches(VALID_CHARACTERS).withMessage(ErrorMessages.FIRST_NAME_PREFIX + ErrorMessages.INVALID_CHARACTERS),
  body("last_name").isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH).matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAST_NAME_PREFIX + ErrorMessages.INVALID_CHARACTERS),
  body("nationality").matches(VALID_CHARACTERS).withMessage(ErrorMessages.NATIONALITY_PREFIX + ErrorMessages.INVALID_CHARACTERS),

  ...usual_residential_address_max_validations,
  ...usual_residential_service_address_max_validations
];
