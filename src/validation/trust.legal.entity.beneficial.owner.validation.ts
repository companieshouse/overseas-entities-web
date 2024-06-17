import { body, check } from "express-validator";
import { ErrorMessages } from "./error.messages";
import { legal_entity_usual_residential_service_address_validations, principal_address_validations } from "./fields/address.validation";
import { dateBecameIPLegalEntityBeneficialOwner, trusteeLegalEntityCeasedDateValidations } from "./fields/date.validation";
import { ErrorMessagesOptional, ErrorMessagesRequired } from "./models/address.error.model";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { isUpdateOrRemoveJourney } from "../utils/url";

const addressErrorMessages: ErrorMessagesOptional = {
  propertyValueError: ErrorMessages.PROPERTY_NAME_OR_NUMBER_LEGAL_ENTITY_BO,
  addressLine1Error: ErrorMessages.ADDRESS_LINE1_LEGAL_ENTITY_BO,
  townValueError: ErrorMessages.CITY_OR_TOWN_LEGAL_ENTITY_BO,
  countryValueError: ErrorMessages.COUNTRY_LEGAL_ENTITY_BO,
};

export const trustLegalEntityBeneficialOwnerValidator = [
  body("legalEntityName")
    .notEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_ENTITY_BO_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  body("roleWithinTrust").notEmpty().withMessage(ErrorMessages.LEGAL_ENTITY_BO_ROLE).if(body("roleWithinTrust")),

  ...dateBecameIPLegalEntityBeneficialOwner,

  body("is_service_address_same_as_principal_address")
    .notEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_LEGAL_ENTITY_BO),

  ...principal_address_validations(addressErrorMessages),
  ...legal_entity_usual_residential_service_address_validations(addressErrorMessages as ErrorMessagesRequired, 'is_service_address_same_as_principal_address'),

  body("legalForm")
    .notEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM_LEGAL_ENTITY_BO)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LEGAL_FORM_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS),

  body("governingLaw")
    .notEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAW_GOVERNED_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS),

  body("is_on_register_in_country_formed_in")
    .notEmpty().withMessage(ErrorMessages.SELECT_IF_ON_PUBLIC_REGISTER_IN_COUNTRY_FORMED_IN),

  body("public_register_name")
    .if(body("is_on_register_in_country_formed_in").equals("1"))
    .notEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PUBLIC_REGISTER_NAME)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS),

  body("public_register_jurisdiction")
    .if(body("is_on_register_in_country_formed_in").equals("1"))
    .notEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PUBLIC_REGISTER_JURISDICTION)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.PUBLIC_REGISTER_JURISDICTION_INVALID_CHARACTERS),

  body("registration_number")
    .if(body("is_on_register_in_country_formed_in").equals("1"))
    .notEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ENTITY_REGISTRATION_NUMBER)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_ENTITY_REGISTRATION_NUMBER)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.INVALID_ENTITY_REGISTRATION_NUMBER)
  ,
  check("public_register_name")
    .if(check("public_register_name").notEmpty())
    .if(check("public_register_jurisdiction").notEmpty())
    .custom( async (value, { req }) => {
      await checkIfLessThanTargetValue(req.body.public_register_name.length, req.body.public_register_jurisdiction.length, 160);
    }),
  check("public_register_jurisdiction")
    .if(check("public_register_jurisdiction").notEmpty())
    .if(check("public_register_name").notEmpty())
    .custom( async (value, { req }) => {
      await checkIfLessThanTargetValue(req.body.public_register_name.length, req.body.public_register_jurisdiction.length, 160);
    }),
  body("stillInvolved")    
    .if((value, { req }) => isUpdateOrRemoveJourney(req))
    .not().isEmpty().withMessage(ErrorMessages.TRUST_STILL_INVOLVED),
    ...trusteeLegalEntityCeasedDateValidations
];

export const checkIfLessThanTargetValue = async (value1: number, value2: number, target: number) => {
  const condition = await Promise.resolve((value1 + value2) > target);
  if (condition){
    throw RangeError(ErrorMessages.NAME_REGISTRATION_JURISDICTION_LEGAL_ENTITY_BO);
  }
};
