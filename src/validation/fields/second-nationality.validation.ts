import { body } from "express-validator";

import { VALID_CHARACTERS } from "../regex/regex.validation";
import { checkSecondNationality } from "../custom.validation";
import { ErrorMessages } from "../error.messages";
import { DefaultErrorsSecondNationality } from "validation/models/second.nationality.error.model";

export const second_nationality_validations = (errors?: DefaultErrorsSecondNationality) => [
  body("second_nationality")
    .matches(VALID_CHARACTERS).withMessage(errors?.invalidCharatersError ?? ErrorMessages.NATIONALITY_INVALID_CHARACTERS)
    .custom((_, { req }) => checkSecondNationality(req.body["nationality"], req.body["second_nationality"], errors))
];
