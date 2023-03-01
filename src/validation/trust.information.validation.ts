import { body } from "express-validator";
import { checkTrustBO, checkTrustFields } from "./custom.validation";

export const trustInformation = [
  body("beneficialOwners").custom((_, { req }) => checkTrustBO(req)),
  body("trusts").custom((_, { req }) => checkTrustFields(req))
];
