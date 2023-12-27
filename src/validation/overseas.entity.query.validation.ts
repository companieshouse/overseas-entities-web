import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_OE_NUMBER_FORMAT } from "./regex/regex.validation";

export const overseasEntityQuery = [
  body("entity_number")
    .not().isEmpty({ ignore_whitespace: true })
    .withMessage(ErrorMessages.OE_QUERY_NUMBER)
    .trim()
    .matches(VALID_OE_NUMBER_FORMAT)
    .withMessage(ErrorMessages.INVALID_OE_NUMBER),
];
