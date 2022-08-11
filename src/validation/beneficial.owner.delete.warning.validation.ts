import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const beneficialOwnerDeleteWarning = [
  body("delete_beneficial_owners").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_YOU_WANT_TO_CHANGE_INFORMATION),
];
