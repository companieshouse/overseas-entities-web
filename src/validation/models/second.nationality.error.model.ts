import { ErrorMessages } from "validation/error.messages";

export type DefaultErrorsSecondNationality = Partial<{
    invalidCharatersError: ErrorMessages,
    sameError: ErrorMessages,
    lengthError: ErrorMessages
  }>;
