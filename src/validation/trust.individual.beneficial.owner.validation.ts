import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import {
  usual_residential_address_validations,
  usual_residential_service_address_validations
} from "./fields/address.validation";
import { second_nationality_validations } from "./fields/second-nationality.validation";
import { dateBecameIPIndividualBeneficialOwner, dateOfBirthValidations, trustIndividualCeasedDateValidations } from "./fields/date.validation";
import { DefaultErrorsSecondNationality } from "./models/second.nationality.error.model";
import { ErrorMessagesOptional, ErrorMessagesRequired } from "./models/address.error.model";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";

const addressErrorMessages: ErrorMessagesOptional = {
  propertyValueError: ErrorMessages.PROPERTY_NAME_OR_NUMBER_INDIVIDUAL_BO,
  addressLine1Error: ErrorMessages.ADDRESS_LINE1_INDIVIDUAL_BO,
  townValueError: ErrorMessages.CITY_OR_TOWN_INDIVIDUAL_BO,
  countryValueError: ErrorMessages.COUNTRY_INDIVIDUAL_BO,
};

const secondNationalityErrors: DefaultErrorsSecondNationality = {
  sameError: ErrorMessages.SECOND_NATIONALITY_IS_SAME_INDIVIDUAL_BO,
};

export const trustIndividualBeneficialOwner = [
  body("forename")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FIRST_NAME_INDIVIDUAL_BO)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH_INDIVIDUAL_BO)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.FIRST_NAME_INVALID_CHARACTERS),
  body("surname")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAST_NAME_INDIVIDUAL_BO)
    .isLength({ max: 50 })
    .withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH_50)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAST_NAME_INVALID_CHARACTERS),

  ...dateOfBirthValidations,

  body("roleWithinTrust").notEmpty().withMessage(ErrorMessages.TRUST_INDIVIDUAL_ROLE_INDIVIDUAL_BO).if(body("roleWithinTrust")),

  ...dateBecameIPIndividualBeneficialOwner,

  body("nationality")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY_INDIVIDUAL_BO)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NATIONALITY_INVALID_CHARACTERS),

  ...second_nationality_validations(secondNationalityErrors),

  body("is_service_address_same_as_usual_residential_address")
    .not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_INDIVIDUAL_BO),

  ...usual_residential_address_validations(addressErrorMessages),
  ...usual_residential_service_address_validations(addressErrorMessages as ErrorMessagesRequired),

  body("stillInvolved")
    .if((value, { req }) => {
      const appData: ApplicationData = getApplicationData(req.session);
      return !!appData.entity_number; // !! = truthy check
    })
    .not().isEmpty().withMessage(ErrorMessages.TRUST_INDIVIDUAL_STILL_INVOLVED),

  ...trustIndividualCeasedDateValidations
];
