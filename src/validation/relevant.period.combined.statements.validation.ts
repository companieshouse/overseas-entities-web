import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue } from "./custom.validation";

import { ErrorMessages } from "./error.messages";

export const relevantPeriodCombinedStatements = [
  body("relevant_period_combined_statements").custom((value, { req }) =>
    checkAtLeastOneFieldHasValue(ErrorMessages.RELEVANT_PERIOD_COMBINED_STATEMENTS_CHECKBOX, req.body.relevant_period_combined_statements))
];
