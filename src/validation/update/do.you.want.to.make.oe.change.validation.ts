import { body } from "express-validator";
import { checkNoChangeStatementSubmission } from "../custom.validation";

export const doYouWantToMakeOeChange = [
  body("no_change")
    .custom(async(value, { req }) => await checkNoChangeStatementSubmission(value, req))
];
