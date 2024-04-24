import { body } from "express-validator";

import { ErrorMessages } from "../error.messages";

export const removeSoldAllLandFilter = [
  body("has_sold_all_land").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_REMOVE_SOLD_ALL_LAND_FILTER)
];
