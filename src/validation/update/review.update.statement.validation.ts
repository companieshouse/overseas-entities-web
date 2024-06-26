import { body } from "express-validator";
import { ErrorMessages } from "../error.messages";
import { StatementResolutionKey, StatementResolutionTypes } from "../../model/statement.resolution.model";
import { isRemoveJourney } from "../../utils/url";

export const reviewUpdateStatementChange = [
  body("no_change_review_statement").custom((value, { req }) => checkNoChangeReviewStatement(value, req))
];

export const statementResolution = [
  body(StatementResolutionKey)
    .isIn(StatementResolutionTypes).withMessage(ErrorMessages.SELECT_UPDATE_STATEMENT_VALIDATION_RESOLUTION),
];

const checkNoChangeReviewStatement = async (value: any, req) => {
  if (value === undefined) {
    if (await isRemoveJourney(req)) {
      throw new Error(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_CHANGES_REMOVE_STATEMENT);
    }

    throw new Error(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_CHANGES_UPDATE_STATEMENT);
  }

  return true;
};
