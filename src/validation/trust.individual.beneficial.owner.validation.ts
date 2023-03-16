import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import {
  ErrorMessagesForURaddress,
  ErrorMessagesForURSaddress,
  usual_residential_address_validations,
  usual_residential_service_address_validations
} from "./fields/address.validation";
import { second_nationality_validations } from "./fields/second-nationality.validation";
import { dateBecameIP, dateOfBirthValidations } from "./fields/date.validation";
import { DefaultErrorsSecondNationality } from "./models/second.nationality.error.model";

const addressErrorMessages: ErrorMessagesForURaddress = {
  propertyValueError: ErrorMessages.PROPERTY_NAME_OR_NUMBER_INDIVIDUAL_BO,
  addressLine1Error: ErrorMessages.ADDRESS_LINE1_INDIVIDUAL_BO,
  townValueError: ErrorMessages.CITY_OR_TOWN_INDIVIDUAL_BO,
  countryValueError: ErrorMessages.COUNTRY_INDIVIDUAL_BO,
};

const seconNationalityErrors: DefaultErrorsSecondNationality = {
  sameError: ErrorMessages.SECOND_NATIONALITY_IS_SAME_INDIVIDUAL_BO,
};

export const trustIndividualBeneficialOwner = [
  body("forename")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FIRST_NAME_INDIVIDUAL_BO)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH_INDIVIDUAL_BO)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.FIRST_NAME_INVALID_CHARACTERS_INDIVIDUAL_BO),
  body("surname")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAST_NAME_INDIVIDUAL_BO)
    .isLength({ max: 50 })
    .withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH_INDIVIDUAL_BO)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAST_NAME_INVALID_CHARACTERS_INDIVIDUAL_BO),

  ...dateOfBirthValidations,

  body("type").notEmpty().withMessage(ErrorMessages.TRUST_INDIVIDUAL_ROLE_INDIVIDUAL_BO).if(body("type")),

  ...dateBecameIP,

  body("nationality")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY_INDIVIDUAL_BO)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NATIONALITY_INVALID_CHARACTERS_INDIVIDUAL_BO),

  ...second_nationality_validations(seconNationalityErrors),

  body("is_service_address_same_as_usual_residential_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_INDIVIDUAL_BO),

  ...usual_residential_address_validations(addressErrorMessages),
  ...usual_residential_service_address_validations(addressErrorMessages as ErrorMessagesForURSaddress),

];
