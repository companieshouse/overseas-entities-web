import { body } from "express-validator";
import { checkTrustBOs, checkTrustFields } from "./custom.validation";

export const trustInformation = [
  body("beneficialOwners").custom((_, { req }) => checkTrustBOs(req)),
  body("trusts").custom((_, { req }) => checkTrustFields(req))
];
