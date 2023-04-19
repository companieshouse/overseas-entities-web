import { body } from "express-validator";
import { DoYouWantToRemoveKey } from "../model/data.types.model";

// import { ErrorMessages } from "./error.messages";

export const confirmToRemove = [
  body(DoYouWantToRemoveKey).not().isEmpty().withMessage("Gon pick something")
];
