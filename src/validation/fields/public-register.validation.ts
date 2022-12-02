import { body } from "express-validator";

import {
  checkFieldIfRadioButtonSelected,
  checkInvalidCharactersIfRadioButtonSelected,
  checkMaxFieldIfRadioButtonSelected,
  checkPublicRegisterJurisdiction
} from "../custom.validation";
import { ErrorMessages } from "../error.messages";

export const entity_public_register_validations = [
  body("public_register_name")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NAME, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS, value) )
    .custom((_, { req }) => checkPublicRegisterJurisdiction(req.body["public_register_name"], req.body["public_register_jurisdiction"])),
  body("public_register_jurisdiction")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_JURISDICTION, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_JURISDICTION_INVALID_CHARACTERS, value) )
    .custom((_, { req }) => checkPublicRegisterJurisdiction(req.body["public_register_name"], req.body["public_register_jurisdiction"])),
  body("registration_number")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NUMBER, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.MAX_ENTITY_PUBLIC_REGISTER_NUMBER_LENGTH, 32, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS, value) )
];

export const public_register_validations = [
  body("public_register_name")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NAME, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.MAX_PUBLIC_REGISTER_NAME_LENGTH, 160, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS, value) ),
  body("registration_number")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NUMBER, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.MAX_PUBLIC_REGISTER_NUMBER_LENGTH, 160, value) )
    .custom((value, { req }) => checkInvalidCharactersIfRadioButtonSelected(req.body.is_on_register_in_country_formed_in === '1', ErrorMessages.PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS, value) )
];
