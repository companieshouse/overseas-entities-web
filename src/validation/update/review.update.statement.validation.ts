import { body } from "express-validator";
import { ErrorMessages } from "../error.messages";

export const reviewUpdateStatementChange = [
  body("no_change_review_statement").not().isEmpty().withMessage(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_CHANGES_UPDATE_STATEMENT)
];
