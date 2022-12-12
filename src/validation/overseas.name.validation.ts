import { body } from "express-validator";
import { EntityNameKey } from "../model/data.types.model";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";

export const overseasName = [
  // TBD: Change ENTITY_NAME name to OVERSEAS_NAME
  body(EntityNameKey)
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.ENTITY_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS)
];
