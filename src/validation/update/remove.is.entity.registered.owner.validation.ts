import { body } from "express-validator";

import { ErrorMessages } from "../error.messages";

export const removeIsEntityRegisteredOwner = [
  body("owner_disposed").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ENTITY_IS_ON_REGISTRY),
];
