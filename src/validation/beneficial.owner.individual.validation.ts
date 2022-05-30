import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { usual_residential_service_address_max_validations, usual_residential_address_max_validations } from "./fields/address.validation";

export const beneficialOwnerIndividual = [
  body("first_name").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH),
  body("last_name").isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH),

  ...usual_residential_address_max_validations,
  ...usual_residential_service_address_max_validations
];
