import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const overseasEntityQuery = [
  body("oe_number").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.OE_QUERY_NAME).isLength({ min: 8, max: 8 }).withMessage(ErrorMessages.MAX_OE_LENGTH),
];
