import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";

export const relevantPeriodProvideInfoNowOrLater = [
  body("provide_information").not().isEmpty().withMessage(ErrorMessages.SELECT_RELEVANT_PERIOD_PROVIDE_INORMATION),
];
