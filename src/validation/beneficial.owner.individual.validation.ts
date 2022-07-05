import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { date_of_birth_validations, start_date_validations } from "./fields/date.validation";
import {
  usual_residential_address_validations,
  usual_residential_service_address_validations
} from "./fields/address.validation";
import { checkFieldIfRadioButtonSelected } from "./custom.validation";
import { nature_of_control_validations } from "./fields/nature-of-control.validation";

export const beneficialOwnerIndividual = [
  body("first_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FIRST_NAME)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.FIRST_NAME_INVALID_CHARACTERS),
  body("last_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAST_NAME)
    .isLength({ max: 160 })
    .withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAST_NAME_INVALID_CHARACTERS),
  body("nationality")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NATIONALITY_INVALID_CHARACTERS),
  body("is_on_sanctions_list")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_sanctions_list === '0', ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST, value) ),

  ...usual_residential_address_validations,
  ...usual_residential_service_address_validations,
  ...start_date_validations,
  ...date_of_birth_validations,
  ...nature_of_control_validations
];
