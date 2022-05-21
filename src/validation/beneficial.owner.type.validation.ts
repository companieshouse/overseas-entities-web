import { check } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const beneficialOwnersType = [
  check("selectedOwnerOfficerType").not().isEmpty().withMessage(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD),
];
