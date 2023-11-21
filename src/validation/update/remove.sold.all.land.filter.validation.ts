import { body } from "express-validator";

import { ErrorMessages } from "../error.messages";

export const removeSoldAllLandFilter = [
  body("disposed_all_land").not().isEmpty().withMessage(ErrorMessages.SELECT_IF_REMOVE_SOLD_ALL_LAND_FILTER),
];
