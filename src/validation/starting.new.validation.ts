import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const startingNew = [
  body("continue_saved_application").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_CONTINUE_SAVED_APPLICATION),
];
