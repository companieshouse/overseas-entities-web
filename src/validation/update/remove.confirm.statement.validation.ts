import { body } from "express-validator";
import { ErrorMessages } from "../error.messages";

export const removeConfirmStatement = [
  body("removal_confirmation").not().isEmpty().withMessage(ErrorMessages.SELECT_TO_CONFIRM_REMOVE_STATEMENT)
];
