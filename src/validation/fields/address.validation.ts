import { body } from "express-validator";

import {
  checkFieldIfRadioButtonSelected,
  checkInvalidCharactersIfRadioButtonSelected,
  checkMaxFieldIfRadioButtonSelected
} from "../custom.validation";
import { ErrorMessages } from "../error.messages";
import { VALID_CHARACTERS } from "../regex/regex.validation";

export const principal_address_validations = [
  body("principal_address_property_name_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER).isLength({ max: 200 }).withMessage(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH),
  body("principal_address_line_1").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH),
  body("principal_address_line_2").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH),
  body("principal_address_town").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH),
  body("principal_address_county").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_COUNTY_LENGTH),
  body("principal_address_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("principal_address_postcode").isLength({ max: 20 }).withMessage(ErrorMessages.MAX_POSTCODE_LENGTH)
];

export const principal_service_address_validations = [
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
  body("service_address_postcode").custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_POSTCODE_LENGTH, 20, value) )
];

export const usual_residential_address_validations = [
  body("usual_residential_address_property_name_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER).isLength({ max: 200 }).withMessage(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH),
  body("usual_residential_address_line_1").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH),
  body("usual_residential_address_line_2").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH),
  body("usual_residential_address_town").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH),
  body("usual_residential_address_county").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_COUNTY_LENGTH),
  body("usual_residential_address_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("usual_residential_address_postcode").isLength({ max: 20 }).withMessage(ErrorMessages.MAX_POSTCODE_LENGTH)
];

export const usual_residential_service_address_validations = [
  body("service_address_property_name_number")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.PROPERTY_NAME_OR_NUMBER, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH, 200, value) ),
  body("service_address_line_1")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.ADDRESS_LINE1, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_ADDRESS_LINE1_LENGTH, 50, value) ),
  body("service_address_line_2").custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_ADDRESS_LINE2_LENGTH, 50, value) ),
  body("service_address_town")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.CITY_OR_TOWN, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_CITY_OR_TOWN_LENGTH, 50, value) ),
  body("service_address_county").custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_COUNTY_LENGTH, 50, value) ),
  body("service_address_country").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.COUNTRY, value) ),
  body("service_address_postcode").custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_POSTCODE_LENGTH, 20, value) )
];

// Checking only MAX for BOs address fields
export const principal_address_max_validations = [
  body("principal_address_property_name_number").isLength({ max: 200 }).withMessage(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH),
  body("principal_address_line_1").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH),
  body("principal_address_line_2").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH),
  body("principal_address_town").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH),
  body("principal_address_county").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_COUNTY_LENGTH),
  body("principal_address_postcode").isLength({ max: 20 }).withMessage(ErrorMessages.MAX_POSTCODE_LENGTH),
];

export const principal_service_address_max_validations = [
  body("service_address_property_name_number")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH, 200, value) ),
  body("service_address_line_1")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_ADDRESS_LINE1_LENGTH, 50, value) ),
  body("service_address_line_2")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_ADDRESS_LINE2_LENGTH, 50, value) ),
  body("service_address_town")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_CITY_OR_TOWN_LENGTH, 50, value) ),
  body("service_address_county")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_COUNTY_LENGTH, 50, value) ),
  body("service_address_postcode")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_POSTCODE_LENGTH, 20, value) ),
];

export const usual_residential_address_beneficial_owner_validation = [
  body("usual_residential_address_property_name_number")
    .isLength({ max: 200 }).withMessage(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS),
  body("usual_residential_address_line_1")
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS),
  body("usual_residential_address_line_2")
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS),
  body("usual_residential_address_town")
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS),
  body("usual_residential_address_county")
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_COUNTY_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS),
  body("usual_residential_address_postcode")
    .isLength({ max: 20 }).withMessage(ErrorMessages.MAX_POSTCODE_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS)
];

export const usual_residential_service_address_beneficial_owner_validation = [
  body("service_address_property_name_number")
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS, value))
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH, 200, value)),
  body("service_address_line_1")
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS, value))
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_ADDRESS_LINE1_LENGTH, 50, value)),
  body("service_address_line_2")
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS, value))
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_ADDRESS_LINE2_LENGTH, 50, value)),
  body("service_address_town")
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_CITY_OR_TOWN_LENGTH, 50, value)),
  body("service_address_county")
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS, value))
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_COUNTY_LENGTH, 50, value)),
  body("service_address_postcode")
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS, value))
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_POSTCODE_LENGTH, 20, value))
];
