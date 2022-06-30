import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const trustInformation = [
  body("trusts").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_DATA_EMPTY)
];
