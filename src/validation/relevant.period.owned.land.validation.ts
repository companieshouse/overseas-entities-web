import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";

export const relevantPeriodOwnedLandFilter = [
  body("owned_land_relevant_period").not().isEmpty().withMessage(ErrorMessages.SELECT_RELEVANT_OWNED_LAND_FILTER),
];
