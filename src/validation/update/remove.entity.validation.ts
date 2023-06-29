import { ErrorMessages } from "../error.messages";
import { body } from "express-validator";

export const removeEntity = [
  body("remove_entity").not().isEmpty().withMessage(ErrorMessages.SELECT_DO_YOU_WANT_TO_REMOVE_ENTITY)
];
