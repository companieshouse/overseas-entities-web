import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { principal_address_max_validations, principal_service_address_max_validations } from "./fields/address.validation";
import { public_register_max_validations } from "./fields/public-register.validation";

export const beneficialOwnerGov = [
  body("name").isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH),

  ...principal_address_max_validations,
  ...principal_service_address_max_validations,

  body("legal_form").isLength({ max: 4000 }).withMessage(ErrorMessages.MAX_LEGAL_FORM_LENGTH),
  body("law_governed").isLength({ max: 4000 }).withMessage(ErrorMessages.MAX_LAW_GOVERNED_LENGTH),

  ...public_register_max_validations
];
