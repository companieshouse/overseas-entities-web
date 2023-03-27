import { ErrorMessages } from "../error.messages";

export type ErrorMessagesOptional = Partial<{
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

export type ErrorMessagesRequired = {
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
  };

export const defaultOptionalErrorMessages: ErrorMessagesOptional = {
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

export const defaultRequiredErrorMessages: ErrorMessagesRequired = defaultOptionalErrorMessages as ErrorMessagesRequired;
