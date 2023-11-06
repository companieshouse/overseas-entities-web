import { body } from "express-validator";

import {
  checkFieldIfRadioButtonSelected,
  checkInvalidCharactersIfRadioButtonSelected,
  checkMaxFieldIfRadioButtonSelected
} from "./custom.validation";
import { ErrorMessages } from "./error.messages";
import { usual_residential_service_address_validations, usual_residential_address_validations } from "./fields/address.validation";
import { second_nationality_validations } from "./fields/second-nationality.validation";
import { VALID_CHARACTERS, VALID_CHARACTERS_FOR_TEXT_BOX } from "./regex/regex.validation";
import {
  date_of_birth_validations,
  resigned_on_validations,
  start_date_validations,
  filingPeriodStartDateValidations,
  filingPeriodResignedDateValidations
} from "./fields/date.validation";

export const managing_officer_name_validation = [
  body("first_name").not().isEmpty({ ignore_whitespace: true })
    .withMessage(ErrorMessages.FIRST_NAME).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.FIRST_NAME_INVALID_CHARACTERS),
  body("last_name").not().isEmpty({ ignore_whitespace: true })
    .withMessage(ErrorMessages.LAST_NAME).isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAST_NAME_INVALID_CHARACTERS),
  body("has_former_names").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME),
  body("former_names")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.has_former_names === '1', ErrorMessages.FORMER_NAME, value))
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.has_former_names === '1', ErrorMessages.MAX_FORMER_NAME_LENGTH, 260, value))
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.has_former_names === '1', ErrorMessages.FORMER_NAMES_INVALID_CHARACTERS, value)),
];

export const managing_officer_nationality_validation = [
  body("nationality")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NATIONALITY_INVALID_CHARACTERS),
  ...second_nationality_validations(),
];

export const managing_officer_address_validation = [
  ...usual_residential_address_validations(),
  body("is_service_address_same_as_usual_residential_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS),
  ...usual_residential_service_address_validations(),
];

export const managing_officer_occupation_validation = [
  body("occupation")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.OCCUPATION)
    .isLength({ max: 100 }).withMessage(ErrorMessages.MAX_OCCUPATION_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.OCCUPATION_INVALID_CHARACTERS),
];

export const managing_officer_role_validation = [
  body("role_and_responsibilities")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ROLE_AND_RESPONSIBILITIES_INDIVIDUAL)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_ROLE_LENGTH)
    .matches(VALID_CHARACTERS_FOR_TEXT_BOX).withMessage(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS),
];

export const managingOfficerIndividual = [
  ...managing_officer_name_validation,
  ...date_of_birth_validations,
  ...managing_officer_nationality_validation,
  ...managing_officer_address_validation,
  ...managing_officer_occupation_validation,
  ...managing_officer_role_validation
];

export const updateManagingOfficerIndividual = [
  ...managingOfficerIndividual,
  ...start_date_validations,
  body("is_still_mo").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_STILL_MANAGING_OFFICER),
  ...resigned_on_validations,
  ...filingPeriodStartDateValidations,
  ...filingPeriodResignedDateValidations
];

export const reviewManagingOfficers = [
  ...managing_officer_name_validation,
  ...managing_officer_nationality_validation,
  ...managing_officer_address_validation,
  ...managing_officer_occupation_validation,
  ...managing_officer_role_validation,
  body("is_still_mo").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_STILL_MANAGING_OFFICER),
  ...resigned_on_validations,
  ...filingPeriodResignedDateValidations
];
