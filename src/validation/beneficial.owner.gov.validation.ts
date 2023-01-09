import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { principal_address_validations, principal_service_address_validations } from "./fields/address.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { checkAtLeastOneFieldHasValue, checkMandatoryDate } from "./custom.validation";

export const beneficialOwnerGov = [
  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.BO_GOV_NAME)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH),

  ...principal_address_validations,

  body("is_service_address_same_as_principal_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS),

  ...principal_service_address_validations,

  body("legal_form")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LEGAL_FORM_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS),

  body("law_governed")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAW_GOVERNED_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS),

  body("beneficial_owner_nature_of_control_types")
    .custom((value, { req }) => checkAtLeastOneFieldHasValue(ErrorMessages.SELECT_NATURE_OF_CONTROL, req.body.beneficial_owner_nature_of_control_types, req.body.non_legal_firm_members_nature_of_control_types)),

  body("is_on_sanctions_list")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST),

  body("start_date")
    .custom((value, { req }) => checkMandatoryDate(req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
];
