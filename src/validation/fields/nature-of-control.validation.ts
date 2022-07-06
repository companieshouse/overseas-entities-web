import { checkFieldIfCheckboxTicked } from "../custom.validation";
import { ErrorMessages } from "../error.messages";
import { body } from "express-validator";

export const nature_of_control_validations = [
  body("")
    .custom((value, { req }) => checkFieldIfCheckboxTicked(
      [
        req.body.beneficial_owner_nature_of_control_types,
        req.body.trustees_nature_of_control_types,
        req.body.non_legal_firm_members_nature_of_control_types
      ],
      ErrorMessages.SELECT_NATURE_OF_CONTROL, value) ),
];
