import { body } from "express-validator";
import { OwnedLandKey } from "../model/update.type.model";
import { ErrorMessages } from "./error.messages";

export const relevantPeriodOwnedLandFilter = [
  body(OwnedLandKey).not().isEmpty().withMessage(ErrorMessages.SELECT_RELEVANT_OWNED_LAND_FILTER),
];