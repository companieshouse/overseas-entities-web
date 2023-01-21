import { logger } from "../utils/logger";
import { VALID_OE_NUMBER_FORMAT } from "../validation/regex/regex.validation";


export const isOENumberValid = (oeNumber: string): boolean => {
  logger.debug("Checking OE number is valid");

  if (!oeNumber) {
    logger.error("No OE number supplied");
    return false;
  }

  if (!VALID_OE_NUMBER_FORMAT.test(oeNumber)) {
    logger.error("Invalid OE number format");
    return false;
  }

  return true;
};