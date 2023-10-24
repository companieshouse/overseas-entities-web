import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { principal_address_validations, principal_service_address_validations } from "./fields/address.validation";
import { public_register_validations } from "./fields/public-register.validation";
import { nature_of_control_validations } from "./fields/nature-of-control.validation";
import { start_date_validations, ceased_date_validations, filingPeriodStartDateValidations } from "./fields/date.validation";

export const beneficialOwnerOther = [
  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.BENEFICIAL_OWNER_OTHER_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  ...principal_address_validations(),

  body("is_service_address_same_as_principal_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS),

  ...principal_service_address_validations,

  body("law_governed")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAW_GOVERNED_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS),

  body("legal_form")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LEGAL_FORM_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS),

  body("is_on_register_in_country_formed_in")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_BENEFICIAL_OWNER_OTHER_REGISTER_IN_COUNTRY_FORMED_IN),

  ...public_register_validations,

  ...start_date_validations,

  ...nature_of_control_validations,

  body("is_on_sanctions_list").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST)
];

export const updateBeneficialOwnerOther = [

  ...beneficialOwnerOther,

  body("is_still_bo").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_STILL_BENEFICIAL_OWNER),

  ...ceased_date_validations,

  ...filingPeriodStartDateValidations
];
