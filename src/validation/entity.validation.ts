import { check } from "express-validator";
import { logger } from "../utils/logger";

import { ErrorMessages } from "./error.messages";

export const entityValidator = [
  check("name").not().isEmpty({ ignore_whitespace: true }).isLength({ max: 160 }).withMessage(`OE Name ${ErrorMessages.MANDANDORY_FIELD}, with max 160 characters`),
  check("incorporation_country").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("principalAddressLine1").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("principalAddressTown").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("principalAddressPostcode").not().isEmpty({ ignore_whitespace: true }).isLength({ max: 20 }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("is_service_address_same_as_principal_address").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.SELECT_ONE_OPTION}`),
  check("serviceAddressLine1").custom((value, { req }) => {
    logger.debug(`VALUE: ${value}, BODY: ${JSON.stringify(req.body, null, 4)}`);
    return req.body.is_service_address_same_as_principal_address !== '0' ? true : value;
  }).not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("serviceAddressTown").custom((value, { req }) => {
    logger.debug(`VALUE: ${value}, BODY: ${JSON.stringify(req.body, null, 4)}`);
    return req.body.is_service_address_same_as_principal_address !== '0' ? true : value;
  }).not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("serviceAddressPostcode").custom((value, { req }) => {
    logger.debug(`VALUE: ${value}, BODY: ${JSON.stringify(req.body, null, 4)}`);
    return req.body.is_service_address_same_as_principal_address !== '0' ? true : value;
  }).not().isEmpty({ ignore_whitespace: true }).isLength({ max: 20 }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check('email').isEmail(),
  check("legal_form").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("law_governed").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("public_register_name").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`),
  check("registration_number").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`)
];
