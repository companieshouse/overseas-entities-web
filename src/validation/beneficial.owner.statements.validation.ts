import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const beneficialOwnersStatement = [
  body("beneficial_owners_statement").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED)
];
