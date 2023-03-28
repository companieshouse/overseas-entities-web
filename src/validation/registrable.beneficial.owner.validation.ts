import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";

export const registrableBeneficialOwner = [
  body(RegistrableBeneficialOwnerKey).not().isEmpty().withMessage(ErrorMessages.SELECT_IF_REGISTRABLE_BENEFICIAL_OWNER),
];

