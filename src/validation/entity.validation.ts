import { body } from "express-validator";

import { checkFieldIfRadioButtonSelected, checkMaxFieldIfRadioButtonSelected } from "./custom.validation";
import { ErrorMessages } from "./error.messages";

export const entity = [
  body("name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ENTITY_NAME).isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH),
  body("incorporation_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("principal_address_property_name_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER).isLength({ max: 200 }).withMessage(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH),
  body("principal_address_line_1").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH),
  body("principal_address_line_2").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH),
  body("principal_address_town").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH),
  body("principal_address_county").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_COUNTY_LENGTH),
  body("principal_address_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("principal_address_postcode").isLength({ max: 20 }).withMessage(ErrorMessages.MAX_POSTCODE_LENGTH),
  body("is_service_address_same_as_principal_address").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS),
  body("service_address_property_name_number")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.PROPERTY_NAME_OR_NUMBER, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH, 200, value) ),
  body("service_address_line_1")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.ADDRESS_LINE1, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_ADDRESS_LINE1_LENGTH, 50, value) ),
  body("service_address_line_2").custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_ADDRESS_LINE2_LENGTH, 50, value) ),
  body("service_address_town")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.CITY_OR_TOWN, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_CITY_OR_TOWN_LENGTH, 50, value) ),
  body("service_address_county").custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_COUNTY_LENGTH, 50, value) ),
  body("service_address_country").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.COUNTRY, value) ),
  body("service_address_postcode").custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_POSTCODE_LENGTH, 20, value) ),
  body('email').not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL).isLength({ max: 250 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH),
  body("legal_form").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM).isLength({ max: 4000 }).withMessage(ErrorMessages.MAX_LEGAL_FORM_LENGTH),
  body("law_governed").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED).isLength({ max: 4000 }).withMessage(ErrorMessages.MAX_LAW_GOVERNED_LENGTH),
  body("is_on_register_in_country_formed_in").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN),
  body("public_register_name")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NAME, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.MAX_PUBLIC_REGISTER_NAME_LENGTH, 4000, value) ),
  body("registration_number")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NUMBER, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.MAX_PUBLIC_REGISTER_NUMBER_LENGTH, 32, value) ),
];
