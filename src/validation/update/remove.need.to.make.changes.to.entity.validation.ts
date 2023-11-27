import { body } from "express-validator";

import { ErrorMessages } from "../error.messages";

export const removeNeedMakeChanges = [
  body("make_changes").not().isEmpty().withMessage(ErrorMessages.SELECT_REMOVE_NEED_TO_MAKE_CHANGES)
];
