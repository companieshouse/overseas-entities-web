import { body } from "express-validator";

import { checkDate, checkFieldIfRadioButtonSelected, checkMaxFieldIfRadioButtonSelected } from "./custom.validation";
import { ErrorMessages } from "./error.messages";

export const managingOfficerIndividual = [
  body("first_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FIRST_NAME).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_FIRST_NAME_LENGTH),
  body("last_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAST_NAME).isLength({ max: 160 }).withMessage(ErrorMessages.MAX_LAST_NAME_LENGTH),
  body("has_former_names").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME),
  body("former_names")
    .custom((value, { req }) => checkFieldIfRadioButtonSelected(req.body.has_former_names === '1', ErrorMessages.FORMER_NAME, value) )
    .custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.has_former_names === '1', ErrorMessages.MAX_FORMER_NAME_LENGTH, 260, value) ),
  body("date_of_birth").custom((value, { req }) => checkDate(ErrorMessages.DATE_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"]) ),
  body("date_of_birth-day").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.DAY_OF_BIRTH),
  body("date_of_birth-month").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MONTH_OF_BIRTH),
  body("date_of_birth-year").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.YEAR_OF_BIRTH),
  body("nationality").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.NATIONALITY),
  body("usual_residential_address_property_name_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER).isLength({ max: 200 }).withMessage(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH),
  body("usual_residential_address_line_1").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH),
  body("usual_residential_address_line_2").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH),
  body("usual_residential_address_town").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN).isLength({ max: 50 }).withMessage(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH),
  body("usual_residential_address_county").isLength({ max: 50 }).withMessage(ErrorMessages.MAX_COUNTY_LENGTH),
  body("usual_residential_address_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  body("usual_residential_address_postcode").isLength({ max: 20 }).withMessage(ErrorMessages.MAX_POSTCODE_LENGTH),
  body("is_service_address_same_as_usual_residential_address").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS),
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
  body("service_address_postcode").custom((value, { req }) => checkMaxFieldIfRadioButtonSelected(req.body.is_service_address_same_as_usual_residential_address === '0', ErrorMessages.MAX_POSTCODE_LENGTH, 20, value) ),
  body("occupation").isLength({ max: 100 }).withMessage(ErrorMessages.MAX_OCCUPATION_LENGTH),
  body("role_and_responsibilities").isLength({ max: 4000 }).withMessage(ErrorMessages.MAX_ROLE_LENGTH)
];
