import { body } from "express-validator";
import { OwnedLandKey } from "../model/update.type.model";

export const relevantPeriodOwnedLand =
[
  body(OwnedLandKey).not().isEmpty()
];
