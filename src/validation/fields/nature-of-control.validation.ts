import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue } from "../custom.validation";
import { ErrorMessages } from "../error.messages";

export const nature_of_control_validations = [
  body("beneficial_owner_nature_of_control_types").custom((value, { req }) =>
    checkAtLeastOneFieldHasValue(ErrorMessages.SELECT_NATURE_OF_CONTROL, req.body.beneficial_owner_nature_of_control_types, req.body.trustees_nature_of_control_types, req.body.non_legal_firm_members_nature_of_control_types)
  )
];
