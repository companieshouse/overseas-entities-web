import { body } from "express-validator";
import { checkBeneficialOwnerType } from "./custom.validation";
import { BeneficialOwnerTypeKey } from "../model/beneficial.owner.type.model";
import { ErrorMessages } from "./error.messages";

export const beneficialOwnersType = [
  body("beneficial_owner_type")
    .custom((value, { req }) => checkBeneficialOwnerType(req.body.beneficial_owners_statement, value))
];

export const updateBeneficialOwnerManagingOfficerType = [
  body(BeneficialOwnerTypeKey).not().isEmpty().withMessage(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD)
];

