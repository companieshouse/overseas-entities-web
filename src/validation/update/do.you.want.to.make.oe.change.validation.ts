import { body } from "express-validator";
import { ErrorMessages } from "../../validation/error.messages";

export const doYouWantToMakeOeChange = [
  body("no_change").not().isEmpty().withMessage(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_OE_CHANGE),
];
