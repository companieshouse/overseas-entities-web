import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue } from "./custom.validation";

import { ErrorMessages } from "./error.messages";

export const relevantPeriodCombinedStatements = [
  body("relevant_period_combined_statements").custom((value, { req }) =>
    checkAtLeastOneFieldHasValue(ErrorMessages.SELECT_RELEVANT_STATEMENTS_OR_NONE_OF_THESE, req.body.relevant_period_combined_statements))
];
