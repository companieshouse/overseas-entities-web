import { body } from "express-validator";
import { ErrorMessages } from "../error.messages";
import { AnyTrustsInvolvedKey } from "../../model/data.types.model";

export const anyTrustsInvolved = [
  body(AnyTrustsInvolvedKey).not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ANY_TRUSTS_INVOLVED),
];
