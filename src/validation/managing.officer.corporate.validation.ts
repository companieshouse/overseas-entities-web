import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { principal_address_validations, principal_service_address_validations } from "./fields/address.validation";
import { public_register_validations } from "./fields/public-register.validation";
import { VALID_CHARACTERS, VALID_CHARACTERS_FOR_TEXT_BOX } from "./regex/regex.validation";
import { contact_email_validations } from "./fields/email.validation";

export const managingOfficerCorporate = [
  body("name").not()
    .isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MANAGING_OFFICER_CORPORATE_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  ...principal_address_validations,

  body("is_service_address_same_as_principal_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_MANAGING_OFFICER_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS),

  ...principal_service_address_validations,

  body("legal_form")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LEGAL_FORM_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS),
  body("law_governed").not()
    .isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAW_GOVERNED_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS),

  body("is_on_register_in_country_formed_in")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_MANAGING_OFFICER_REGISTER_IN_COUNTRY_FORMED_IN),

  ...public_register_validations,

  body("role_and_responsibilities")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ROLE_AND_RESPONSIBILITIES_CORPORATE)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_ROLE_LENGTH)
    .matches(VALID_CHARACTERS_FOR_TEXT_BOX).withMessage(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS),

  body("contact_full_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FULL_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_FULL_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.CONTACT_NAME_INVALID_CHARACTERS),

  ...contact_email_validations
];
