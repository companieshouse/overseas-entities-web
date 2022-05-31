import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const soldLandFilter = [

  body("has_sold_land").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_ENTITY_HAS_SOLD_LAND),
];
