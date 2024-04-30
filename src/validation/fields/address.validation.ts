import { body } from "express-validator";
import { defaultRequiredErrorMessages, defaultOptionalErrorMessages, ErrorMessagesOptional, ErrorMessagesRequired } from "../models/address.error.model";

import {
  addressFieldsHaveNoValue,
  checkPropertyNameOrNumberIfRadioButtonSelected,
  checkFieldIfRadioButtonSelected,
  checkFieldIfRadioButtonSelectedAndFieldsEmpty,
  checkInvalidCharactersIfRadioButtonSelected,
  checkMaxFieldIfRadioButtonSelected,
  checkPresenceOfPropertyNameOrNumber
} from "../custom.validation";
import { ErrorMessages } from "../error.messages";
import { VALID_CHARACTERS } from "../regex/regex.validation";

export const overseas_entity_address_validations = (errors: ErrorMessagesOptional = defaultOptionalErrorMessages) => {
  errors = { ...defaultOptionalErrorMessages, ...errors };
  return [
    body("principal_address_property_name_number")
      .custom((value, { req }) => checkPresenceOfPropertyNameOrNumber(value, req) )
      .isLength({ max: 50 }).withMessage(errors.maxPropertyValueLengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.propertyNameInvalidError),
    body("principal_address_line_1")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.addressLine1Error)
      .isLength({ max: 50 }).withMessage(errors.addressLine1LengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.addressLine1InvalidCharacterError),
    body("principal_address_line_2")
      .isLength({ max: 50 }).withMessage(errors.addressLine2LengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.addressLine2InvalidCharacterError),
    body("principal_address_town")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.townValueError)
      .isLength({ max: 50 }).withMessage(errors.maxTownValueLengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.townInvalidCharacterError),
    body("principal_address_county")
      .isLength({ max: 50 }).withMessage(errors.maxCountyValueLengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.countyInvalidCharacterError),
    body("principal_address_country")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.countryValueError),
    body("principal_address_postcode")
      .isLength({ max: 15 }).withMessage(errors.postcodeLengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.postcodeInvalidCharacterError)
  ];
};

export const principal_address_validations = (errors: ErrorMessagesOptional = defaultOptionalErrorMessages) => {
  errors = { ...defaultOptionalErrorMessages, ...errors };
  return [
    body("principal_address_property_name_number")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.propertyValueError)
      .isLength({ max: 50 }).withMessage(errors.maxPropertyValueLengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.propertyNameInvalidError),
    body("principal_address_line_1")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.addressLine1Error)
      .isLength({ max: 50 }).withMessage(errors.addressLine1LengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.addressLine1InvalidCharacterError),
    body("principal_address_line_2")
      .isLength({ max: 50 }).withMessage(errors.addressLine2LengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.addressLine2InvalidCharacterError),
    body("principal_address_town")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.townValueError)
      .isLength({ max: 50 }).withMessage(errors.maxTownValueLengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.townInvalidCharacterError),
    body("principal_address_county")
      .isLength({ max: 50 }).withMessage(errors.maxCountyValueLengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.countyInvalidCharacterError),
    body("principal_address_country")
      .not().isEmpty({ ignore_whitespace: true }).withMessage(errors.countryValueError),
    body("principal_address_postcode")
      .isLength({ max: 15 }).withMessage(errors.postcodeLengthError)
      .matches(VALID_CHARACTERS).withMessage(errors.postcodeInvalidCharacterError)
  ];
};

export const overseas_entity_service_address_validations = [
  body("service_address_property_name_number")
    .custom((value, { req }) => checkPropertyNameOrNumberIfRadioButtonSelected(req.body.is_service_address_same_as_principal_address === '0', value, req) )
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

export const usual_residential_address_validations = (errors: ErrorMessagesOptional = defaultOptionalErrorMessages) => {
  errors = { ...defaultOptionalErrorMessages, ...errors };
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

export const usual_residential_service_address_validations = (errors: ErrorMessagesRequired = defaultRequiredErrorMessages, radioButtonElementID: string = "is_service_address_same_as_usual_residential_address") => {
  errors = { ...defaultRequiredErrorMessages, ...errors };
  return [
    body("service_address_property_name_number")
      .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.propertyValueError, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.maxPropertyValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.propertyNameInvalidError, value)),
    body("service_address_line_1")
      .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine1Error, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine1LengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine1InvalidCharacterError, value)),
    body("service_address_line_2")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine2LengthError, 50, value))
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine2InvalidCharacterError, value)),
    body("service_address_town")
      .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.townValueError, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.maxTownValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.townInvalidCharacterError, value)),
    body("service_address_county")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.maxCountyValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.countyInvalidCharacterError, value)),
    body("service_address_country").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.countryValueError, value) ),
    body("service_address_postcode")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.postcodeLengthError, 15, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.postcodeInvalidCharacterError, value)),
  ];
};

export const legal_entity_usual_residential_service_address_validations = (errors: ErrorMessagesRequired = defaultRequiredErrorMessages, radioButtonElementID: string = "is_service_address_same_as_usual_residential_address") => {
  errors = { ...defaultRequiredErrorMessages, ...errors };

  const addressFields = [
    "service_address_property_name_number",
    "service_address_line_1",
    "service_address_line_2",
    "service_address_town",
    "service_address_county",
    "service_address_country",
    "service_address_postcode",
  ];

  return [
    body("service_address_property_name_number")
      .custom(async (value, { req }) => checkFieldIfRadioButtonSelectedAndFieldsEmpty(true, await addressFieldsHaveNoValue(req.body, addressFields, req.body[`${radioButtonElementID}`] === '0'), req.body[`${radioButtonElementID}`] === '0', errors.propertyValueError, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.maxPropertyValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.propertyNameInvalidError, value)),
    body("service_address_line_1")
      .custom(async (value, { req }) => checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, await addressFieldsHaveNoValue(req.body, addressFields, req.body[`${radioButtonElementID}`] === '0'), req.body[`${radioButtonElementID}`] === '0', errors.addressLine1Error, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine1LengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine1InvalidCharacterError, value)),
    body("service_address_line_2")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine2LengthError, 50, value))
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.addressLine2InvalidCharacterError, value)),
    body("service_address_town")
      .custom(async (value, { req }) => checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, await addressFieldsHaveNoValue(req.body, addressFields, req.body[`${radioButtonElementID}`] === '0'), req.body[`${radioButtonElementID}`] === '0', errors.townValueError, value) )
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.maxTownValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.townInvalidCharacterError, value)),
    body("service_address_county")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.maxCountyValueLengthError, 50, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.countyInvalidCharacterError, value)),
    body("service_address_country")
      .custom(async (value, { req }) => checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, await addressFieldsHaveNoValue(req.body, addressFields, req.body[`${radioButtonElementID}`] === '0'), req.body[`${radioButtonElementID}`] === '0', errors.countryValueError, value) ),
    body("service_address_postcode")
      .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.postcodeLengthError, 15, value) )
      .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body[`${radioButtonElementID}`] === '0', errors.postcodeInvalidCharacterError, value)),
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

