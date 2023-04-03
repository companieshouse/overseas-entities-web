import { body } from "express-validator";

import { ErrorMessages } from "../error.messages";

export const updateContinueSavedFiling = [
  body("continue_saved_filing").not().isEmpty().withMessage(ErrorMessages.UPDATE_SELECT_IF_CONTINUE_SAVED_FILING),
];
