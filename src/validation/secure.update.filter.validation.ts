import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";

export const secureUpdateFilter = [
  body("is_secure_update").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SECURE_UPDATE_FILTER),
];
