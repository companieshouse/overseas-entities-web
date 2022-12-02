import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { principal_address_validations, principal_service_address_validations } from "./fields/address.validation";
import { entity_public_register_validations } from "./fields/public-register.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { email_validations } from "./fields/email.validation";

export const entity = [
  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ENTITY_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS),
  body("incorporation_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),

  ...principal_address_validations,
  body("is_service_address_same_as_principal_address").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS),

  ...principal_service_address_validations,
  ...email_validations,

  body("legal_form")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_ENTITY_LEGAL_FORM_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS),
  body("law_governed")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_ENTITY_LAW_GOVERNED_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS),

  body("is_on_register_in_country_formed_in").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN),

  ...entity_public_register_validations
];
