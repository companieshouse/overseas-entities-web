import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import {
  trust_individual_form_validations,
  usual_residential_service_address_validations
} from "./fields/address.validation";
import { second_nationality_validations } from "./fields/second-nationality.validation";
import { dateBecameIP, dateOfBirthValidations } from "./fields/date.validation";

export const trustIndividualBeneficialOwner = [
  body("forename")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FIRST_NAME)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.FIRST_NAME_INVALID_CHARACTERS),
  body("surname")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAST_NAME)
    .isLength({ max: 160 })
    .withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAST_NAME_INVALID_CHARACTERS),

  ...dateOfBirthValidations,

  body("type").notEmpty().withMessage(ErrorMessages.TRUST_INDIVIDUAL_ROLE).if(body("type")),

  ...dateBecameIP,

  body("nationality")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NATIONALITY_INVALID_CHARACTERS),

  ...second_nationality_validations,

  body("is_service_address_same_as_usual_residential_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS),

  ...trust_individual_form_validations,
  ...usual_residential_service_address_validations,

];
