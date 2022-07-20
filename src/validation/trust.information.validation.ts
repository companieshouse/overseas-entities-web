import { body } from "express-validator";
import { checkAtLeastOneFieldHasValue } from "./custom.validation";

import { ErrorMessages } from "./error.messages";
import { trustType } from "../model";
import { TrustKey } from "../model/trust.model";

export const trustInformation = [
  body("trusts").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_DATA_EMPTY),
  body("beneficialOwners").custom((value, { req }) =>
    checkAtLeastOneFieldHasValue(ErrorMessages.TRUST_BO_CHECKBOX, req.body.beneficialOwners))
];

export type TrustValidationError = {
  param: any;
  msg: any;
};

export const checkMandatoryTrustFields = (trusts: trustType.Trust[]): TrustValidationError[] => {
  const errors: TrustValidationError[] = [];
  trusts.forEach(trust => {

    if (
      trust.creation_date_day === undefined ||
      trust.creation_date_day === "" ||
      trust.creation_date_month === undefined ||
      trust.creation_date_month === "" ||
      trust.creation_date_year === undefined ||
      trust.creation_date_year === ""
    ) {
      const err: TrustValidationError = {
        param: TrustKey,
        msg: ErrorMessages.TRUST_CREATION_DATE
      };
      errors.push(err);
    }
    if (trust.trust_name === undefined || trust.trust_name === "") {
      const err: TrustValidationError = {
        param: TrustKey,
        msg: ErrorMessages.TRUST_NAME
      };
      errors.push(err);
    }
  });
  return errors;
};
