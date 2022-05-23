import { body } from "express-validator";

import { checkDate, checkFieldIfRadioButtonSelected } from "./custom.validation";
import { ErrorMessages } from "./error.messages";

export const managingOfficerIndividual = [
  body("first_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FIRST_NAME),
  body("last_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAST_NAME),
  body("has_former_names").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME),
  body("former_names").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.has_former_names === '1', value, ErrorMessages.FORMER_NAME) ),
  body("date_of_birth").custom((value, { req }) => checkDate(req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"], ErrorMessages.DATE_OF_BIRTH) ),
  body("date_of_birth-day").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.DAY),
  body("date_of_birth-month").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MONTH),
  body("date_of_birth-year").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.YEAR),
  body("nationality").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY),
  body("usual_residential_address_property_name_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER),
  body("usual_residential_address_line_1").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1),
  body("usual_residential_address_town").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN),
  body("usual_residential_address_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("is_service_address_same_as_usual_residential_address").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS),
  body("service_address_property_name_number").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', value, ErrorMessages.PROPERTY_NAME_OR_NUMBER) ),
  body("service_address_line_1").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', value, ErrorMessages.ADDRESS_LINE1) ),
  body("service_address_town").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', value, ErrorMessages.CITY_OR_TOWN) ),
  body("service_address_country").custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', value, ErrorMessages.COUNTRY) ),
  body("role_and_responsibilities").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ROLE)
];
