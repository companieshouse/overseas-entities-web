import { body } from "express-validator";
import { checkBeneficialOwnersSubmission } from "./custom.validation";

export const beneficialOwnersTypeSubmission = [
  body("beneficial_owner_type")
    .custom(async(value, { req }) => await checkBeneficialOwnersSubmission(req))
];
