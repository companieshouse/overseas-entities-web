import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { identity_address_validations } from "./fields/address.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import {
  checkDateFieldDay,
  checkDateFieldMonth,
  checkDateFieldYear,
  checkOptionalDate
} from "./custom.validation";
import { email_validations } from "./fields/email.validation";

export const overseasEntityDueDiligence = [

  // to prevent more than 1 error reported on the date fields we check if the year is valid before doing some checks.
  // This means that the year check is checked before some others
  body("identity_date-day")
    .if(body("identity_date-year").isLength({ min: 4, max: 4 }))
    .custom((value, { req }) => checkDateFieldDay(ErrorMessages.DAY, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-month")
    .if(body("identity_date-year").isLength({ min: 4, max: 4 }))
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date")
    .custom((value, { req }) => checkOptionalDate(req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),

  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.OE_DUE_DILIGENCE_NAME)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_NAME_LENGTH_DUE_DILIGENCE)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  ...identity_address_validations,
  ...email_validations,

  body("aml_number")
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_AML_NUMBER_LENGTH),

  body("supervisory_name")
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_SUPERVISORY_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  body("partner_name")
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_PARTNER_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),
];
