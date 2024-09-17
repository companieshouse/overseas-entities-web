import { body } from "express-validator";
import { ErrorMessages } from "../error.messages";
import { StatementResolutionKey, StatementResolutionTypes } from "../../model/statement.resolution.model";

export const statementResolution = [
  body(StatementResolutionKey).isIn(StatementResolutionTypes).withMessage(ErrorMessages.SELECT_UPDATE_STATEMENT_VALIDATION_RESOLUTION),
];
