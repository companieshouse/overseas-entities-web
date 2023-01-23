import { body } from "express-validator";
import { validateEmail } from "../custom.validation";

export const email_validations = [
  body("email").trim()
    .custom((value, { req }) => validateEmail(req.body["email"], 256))
];

export const contact_email_validations = [
  body("contact_email").trim()
    .custom((value, { req }) => validateEmail(req.body["contact_email"], 250))
];
