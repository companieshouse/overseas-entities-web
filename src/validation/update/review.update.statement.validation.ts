import { body } from "express-validator";
import { ErrorMessages } from "../error.messages";
import { StatementResolutionKey, StatementResolutionTypes } from "../../model/statement.resolution.model";

export const reviewUpdateStatementChange = [
  body("no_change_review_statement").not().isEmpty().withMessage(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_CHANGES_UPDATE_STATEMENT)
];

export const statementResolution = [
  body(StatementResolutionKey)
    .isIn(StatementResolutionTypes).withMessage(ErrorMessages.SELECT_UPDATE_STATEMENT_VALIDATION_RESOLUTION),
];
