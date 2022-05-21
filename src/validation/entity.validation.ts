import { check } from "express-validator";
// import { logger } from "../utils/logger";

import { ErrorMessages } from "./error.messages";

export const entity = [
  check("name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ENTITY_NAME),
  check("incorporation_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  check("principal_address_property_name_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PROPERTY_NAME_OR_NUMBER),
  check("principal_address_line_1").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ADDRESS_LINE1),
  check("principal_address_town").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.CITY_OR_TOWN),
  check("principal_address_country").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.COUNTRY),
  check("is_service_address_same_as_principal_address").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS),
  // check("serviceAddressLine1").custom((value, { req }) => {
  //   logger.debug(`VALUE: ${value}, BODY: ${JSON.stringify(req.body, null, 4)}`);
  //   return req.body.is_service_address_same_as_principal_address !== '0' ? true : value;
  // }).not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MANDANDORY_FIELD),
  // check("serviceAddressTown").custom((value, { req }) => {
  //   logger.debug(`VALUE: ${value}, BODY: ${JSON.stringify(req.body, null, 4)}`);
  //   return req.body.is_service_address_same_as_principal_address !== '0' ? true : value;
  // }).not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MANDANDORY_FIELD),
  // check("serviceAddressPostcode").custom((value, { req }) => {
  //   logger.debug(`VALUE: ${value}, BODY: ${JSON.stringify(req.body, null, 4)}`);
  //   return req.body.is_service_address_same_as_principal_address !== '0' ? true : value;
  // }).not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MANDANDORY_FIELD),
  check('email').not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL),
  check("legal_form").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LEGAL_FORM),
  check("law_governed").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.LAW_GOVERNED),
  check("is_on_register_in_country_formed_in").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN),
  // check("public_register_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PUBLIC_REGISTER_NAME),
  // check("registration_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PUBLIC_REGISTER_NUMBER)
  // oneOf([
  //   [
  //     check("public_register_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PUBLIC_REGISTER_NAME),
  //     check("registration_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PUBLIC_REGISTER_NUMBER)
  //   ],
  //   check('is_on_register_in_country_formed_in').equals('0')
  // ], "Enter the name and registration number"),
];
