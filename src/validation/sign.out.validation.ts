import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";

export const signOut = [
  body("sign_out").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_SIGN_OUT)
];
