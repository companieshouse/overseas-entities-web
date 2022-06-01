import { body } from "express-validator";

import { checkFieldIfRadioButtonSelected, checkMaxFieldIfRadioButtonSelected } from "./custom.validation";
import { ErrorMessages } from "./error.messages";
import { usual_residential_service_address_validations, usual_residential_address_validations } from "./fields/address.validation";
import { date_of_birth_validations } from "./fields/date.validation";

export const managingOfficerIndividual = [
  body("first_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FIRST_NAME).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH),
  body("last_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAST_NAME).isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH),
  body("has_former_names").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME),
  body("former_names")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.has_former_names === '1', ErrorMessages.FORMER_NAME, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.has_former_names === '1', ErrorMessages.MAX_FORMER_NAME_LENGTH, 260, value) ),

  ...date_of_birth_validations,

  body("nationality").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY),

  ...usual_residential_address_validations,

  body("is_service_address_same_as_usual_residential_address").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS),

  ...usual_residential_service_address_validations,
  body("occupation").isLength({ max: 100 }).withMessage(ErrorMessages.MAX_OCCUPATION_LENGTH),
  body("role_and_responsibilities").isLength({ max: 4000 }).withMessage(ErrorMessages.MAX_ROLE_LENGTH)
];
