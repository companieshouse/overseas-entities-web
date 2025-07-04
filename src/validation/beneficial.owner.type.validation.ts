import { body } from "express-validator";
import { checkBeneficialOwnerType } from "./custom.validation";
import { BeneficialOwnerTypeKey, BeneficialOwnerTypeRPKey } from "../model/beneficial.owner.type.model";
import { ErrorMessages } from "./error.messages";

export const beneficialOwnersType = [
  body(BeneficialOwnerTypeKey, BeneficialOwnerTypeRPKey)
    .custom((value, { req }) => checkBeneficialOwnerType(req.body.beneficial_owners_statement, value))
];

export const updateBeneficialOwnerAndManagingOfficerType = [
  body(BeneficialOwnerTypeKey)
    .custom((value, { req }) => {
      if (!value && !req.body[BeneficialOwnerTypeRPKey]) {
        throw new Error(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD);
      }
      return true;
    }),

  body(BeneficialOwnerTypeRPKey)
    .custom((value, { req }) => {
      // Check visibility field for BeneficialOwnerTypeRPKey
      const isVisible = req.body.isBeneficialOwnerTypeRPVisible === "true";
      if (isVisible && !value && !req.body[BeneficialOwnerTypeKey]) {
        throw new Error(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_YOU_WANT_TO_ADD_RELEVANT_PERIOD);
      }
      return true;
    }),
];
