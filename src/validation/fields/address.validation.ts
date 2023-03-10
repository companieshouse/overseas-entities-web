import { body } from "express-validator";

import {
  checkFieldIfRadioButtonSelected,
  checkInvalidCharactersIfRadioButtonSelected,
  checkMaxFieldIfRadioButtonSelected
} from "../custom.validation";
import { ErrorMessages } from "../error.messages";
import { VALID_CHARACTERS } from "../regex/regex.validation";

export const principal_address_validations = [
  body("principal_address_property_name_number")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS),
  body("principal_address_line_1")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS),
  body("principal_address_line_2")
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS),
  body("principal_address_town")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS),
  body("principal_address_county")
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_COUNTY_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS),
  body("principal_address_country")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("principal_address_postcode")
    .isLength({ max: 15 }).withMessage(ErrorMessages.MAX_POSTCODE_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS)
];

export const principal_service_address_validations = [
  body("service_address_property_name_number")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.PROPERTY_NAME_OR_NUMBER, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH, 50, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS, value) ),
  body("service_address_line_1")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.ADDRESS_LINE1, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_ADDRESS_LINE1_LENGTH, 50, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS, value) ),
  body("service_address_line_2")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_ADDRESS_LINE2_LENGTH, 50, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS, value) ),
  body("service_address_town")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.CITY_OR_TOWN, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_CITY_OR_TOWN_LENGTH, 50, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS, value) ),
  body("service_address_county")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_COUNTY_LENGTH, 50, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS, value) ),
  body("service_address_country")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.COUNTRY, value) ),
  body("service_address_postcode")
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.MAX_POSTCODE_LENGTH, 15, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS, value) ),
];

export type ErrorMessagesForURSaddress = Partial<{
  propertyValueError: ErrorMessages,
  maxPropertyValueLengthError: ErrorMessages,
  propertyNameInvalidError: ErrorMessages,
  addressLine1Error: ErrorMessages,
  addressLine1LengthError: ErrorMessages,
  addressLine1InvalidCharacterError: ErrorMessages,
  addressLine2LengthError: ErrorMessages,
  addressLine2InvalidCharacterError: ErrorMessages,
  townValueError: ErrorMessages,
  maxTownValueLengthError: ErrorMessages,
  townInvalidCharacterError: ErrorMessages,
  maxCountyValueLengthError: ErrorMessages,
  countyInvalidCharacterError: ErrorMessages,
  countryValueError: ErrorMessages,
  postcodeLengthError: ErrorMessages,
  postcodeInvalidCharacterError: ErrorMessages,
}>;

const defaultErrorMessagesForURSAddresses = {
  propertyValueError: ErrorMessages.PROPERTY_NAME_OR_NUMBER,
  maxPropertyValueLengthError: ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH,
  propertyNameInvalidError: ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS,
  addressLine1Error: ErrorMessages.ADDRESS_LINE1,
  addressLine1LengthError: ErrorMessages.MAX_ADDRESS_LINE1_LENGTH,
  addressLine1InvalidCharacterError: ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS,
  addressLine2LengthError: ErrorMessages.MAX_ADDRESS_LINE2_LENGTH,
  addressLine2InvalidCharacterError: ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS,
  townValueError: ErrorMessages.CITY_OR_TOWN,
  maxTownValueLengthError: ErrorMessages.MAX_CITY_OR_TOWN_LENGTH,
  townInvalidCharacterError: ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS,
  maxCountyValueLengthError: ErrorMessages.MAX_COUNTY_LENGTH,
  countyInvalidCharacterError: ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS,
  countryValueError: ErrorMessages.COUNTRY,
  postcodeLengthError: ErrorMessages.MAX_POSTCODE_LENGTH,
  postcodeInvalidCharacterError: ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS,
};

export const usual_residential_address_validations = (errors: ErrorMessagesForURSaddress) => {
  errors = { ...defaultErrorMessagesForURSAddresses, ...errors };
  return [
    body("usual_residential_address_property_name_number")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.propertyValueError)
      .matches(VALID_CHARACTERS).withMessage(errors.propertyNameInvalidError)
      .isLength({ max: 50 }).withMessage(errors.maxPropertyValueLengthError),
    body("usual_residential_address_line_1")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.addressLine1Error)
      .matches(VALID_CHARACTERS).withMessage(errors.addressLine1InvalidCharacterError)
      .isLength({ max: 50 }).withMessage(errors.addressLine1LengthError),
    body("usual_residential_address_line_2")
      .matches(VALID_CHARACTERS).withMessage(errors.addressLine2InvalidCharacterError)
      .isLength({ max: 50 }).withMessage(errors.addressLine2LengthError),
    body("usual_residential_address_town")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.townValueError)
      .matches(VALID_CHARACTERS).withMessage(errors.townInvalidCharacterError)
      .isLength({ max: 50 }).withMessage(errors.maxTownValueLengthError),
    body("usual_residential_address_county")
      .matches(VALID_CHARACTERS).withMessage(errors.countyInvalidCharacterError)
      .isLength({ max: 50 }).withMessage(errors.maxCountyValueLengthError),
    body("usual_residential_address_country")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.countryValueError),
    body("usual_residential_address_postcode")
      .matches(VALID_CHARACTERS).withMessage(errors.postcodeInvalidCharacterError)
      .isLength({ max: 15 }).withMessage(errors.postcodeLengthError)
  ];
};

export const usual_residential_service_address_validations = (errors: Required<ErrorMessagesForURSaddress>) => {
  errors = { ...defaultErrorMessagesForURSAddresses, ...errors };
  return [
    body("service_address_property_name_number")
      .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.propertyValueError, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.maxPropertyValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.propertyNameInvalidError, value)),
    body("service_address_line_1")
      .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.addressLine1Error, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.addressLine1LengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.addressLine1InvalidCharacterError, value)),
    body("service_address_line_2")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.addressLine2LengthError, 50, value))
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.addressLine2InvalidCharacterError, value)),
    body("service_address_town")
      .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.townValueError, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.maxTownValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.townInvalidCharacterError, value)),
    body("service_address_county")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.maxCountyValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.countyInvalidCharacterError, value)),
    body("service_address_country").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.countryValueError, value) ),
    body("service_address_postcode")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.postcodeLengthError, 15, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', errors.postcodeInvalidCharacterError, value)),
  ];
};

export const identity_address_validations = [
  body("identity_address_property_name_number")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS),
  body("identity_address_line_1")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS),
  body("identity_address_line_2")
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS),
  body("identity_address_town")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS),
  body("identity_address_county")
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_COUNTY_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS),
  body("identity_address_country")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.UK_COUNTRY),
  body("identity_address_postcode")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.POSTCODE)
    .isLength({ max: 15 }).withMessage(ErrorMessages.MAX_POSTCODE_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS)
];
