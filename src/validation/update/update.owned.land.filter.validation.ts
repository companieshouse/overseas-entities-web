import { body } from "express-validator";

import { OwnedLandKey } from "../../model/owned.land.filter.model";
import { ErrorMessages } from "../error.messages";

export const updateOwnedLand = [
  body(OwnedLandKey).not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ENTITY_HAS_OWNED_LAND),
];
