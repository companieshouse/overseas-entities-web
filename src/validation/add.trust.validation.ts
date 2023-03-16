import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const addTrustValidations = [
  body("addTrust").notEmpty().withMessage(ErrorMessages.ADD_TRUST),
];
