import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const startingNew = [
  body("starting_new").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_STARTING_NEW),
];
