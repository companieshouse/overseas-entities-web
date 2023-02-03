import { body } from "express-validator";
import { checkBeneficialOwnerSubmission } from "./custom.validation";

export const beneficialOwnersTypeSubmission = [
  body("beneficial_owner_type")
    .custom((value, { req }) =>  checkBeneficialOwnerSubmission(req))
];
