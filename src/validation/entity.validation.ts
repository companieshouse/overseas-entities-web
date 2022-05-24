import { body } from "express-validator";

import { checkFieldIfRadioButtonSelected } from "./custom.validation";
import { ErrorMessages } from "./error.messages";

export const entity = [
  body("name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ENTITY_NAME),
  body("incorporation_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("principal_address_property_name_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER),
  body("principal_address_line_1").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1),
  body("principal_address_town").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN),
  body("principal_address_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("is_service_address_same_as_principal_address").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS),
  body("service_address_property_name_number").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.PROPERTY_NAME_OR_NUMBER, value) ),
  body("service_address_line_1").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.ADDRESS_LINE1, value) ),
  body("service_address_town").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.CITY_OR_TOWN, value) ),
  body("service_address_country").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.COUNTRY, value) ),
  body('email').not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL),
  body("legal_form").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM),
  body("law_governed").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED),
  body("is_on_register_in_country_formed_in").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN),
  body("public_register_name").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NAME, value) ),
  body("registration_number").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NUMBER, value) )
];
