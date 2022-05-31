import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";

export const secureRegisterFilter = [

  body("secure_register").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SECURE_REGISTER_FILTER),
];
