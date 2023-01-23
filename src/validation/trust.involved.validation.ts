import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";
import { TrusteeType } from '../model/trustee.type.model';

export const trustInvolved = [
  body('typeOfTrustee')
    //  contains correct value
    .isIn(Object.values(TrusteeType)).withMessage(ErrorMessages.TRUST_INVOLVED_INVALID),
];
