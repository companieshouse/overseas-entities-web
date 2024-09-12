import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import {
  usual_residential_address_validations,
  usual_residential_service_address_validations
} from "./fields/address.validation";
import { nature_of_control_validations } from "./fields/nature-of-control.validation";
import { second_nationality_validations } from "./fields/second-nationality.validation";
import {
  date_of_birth_validations,
  start_date_validations,
  ceased_date_validations
} from "./fields/date.validation";

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

  ...date_of_birth_validations,

  body("nationality")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NATIONALITY_INVALID_CHARACTERS),

  ...second_nationality_validations(),

  body("is_on_sanctions_list")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST),
  body("is_service_address_same_as_usual_residential_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS),

  ...usual_residential_address_validations(),
  ...usual_residential_service_address_validations(),

  ...start_date_validations,

  ...nature_of_control_validations
];

export const updateBeneficialOwnerIndividual = [

  ...beneficialOwnerIndividual,

  body("is_still_bo").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_STILL_BENEFICIAL_OWNER),

  ...ceased_date_validations
];
