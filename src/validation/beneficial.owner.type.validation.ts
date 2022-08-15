import { body } from "express-validator";
import { checkBeneficialOwnerType } from "./custom.validation";

export const beneficialOwnersType = [
  body("beneficial_owner_type")
    .custom((value, { req }) =>  checkBeneficialOwnerType(req.session, value))
];

