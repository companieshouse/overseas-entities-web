import { body } from "express-validator";
import { checkNoChangeStatementSubmission } from "../custom.validation";

export const doYouWantToMakeOeChange = [
  body("no_change")
    .custom((value, { req }) => checkNoChangeStatementSubmission(value, req))
];
