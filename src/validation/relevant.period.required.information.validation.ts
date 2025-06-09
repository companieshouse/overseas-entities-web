import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";

export const relevantPeriodRequiredInformation = [
  body("required_information").not().isEmpty().withMessage(ErrorMessages.SELECT_RELEVANT_PERIOD_REQUIRED_INFORMATION),
];