import { body } from "express-validator";

import { WhoIsRegisteringKey } from "../model/who.is.making.filing.model";
import { ErrorMessages } from "./error.messages";

export const whoIsMakingFiling = [
  body(WhoIsRegisteringKey).not().isEmpty().withMessage(ErrorMessages.SELECT_WHO_IS_MAKING_FILING),
];

export const whoIsMakingUpdate = [
  body(WhoIsRegisteringKey).not().isEmpty().withMessage(ErrorMessages.SELECT_WHO_IS_MAKING_FILING_UPDATE),
];
