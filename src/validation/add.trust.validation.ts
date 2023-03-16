import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const addTrust = [
  body("addTrust").notEmpty().withMessage(ErrorMessages.ADD_TRUST),
];
