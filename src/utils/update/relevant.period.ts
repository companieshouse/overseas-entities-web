import { InputDate } from "../../model/data.types.model";
import { checkDateValueIsValid } from "../../validation/custom.validation";
import { logger } from "../../utils/logger";

const endOfPeriod: InputDate = {
  day: "31",
  month: "01",
  year: "2023"
};

const checkRelevantPeriodDates = (dateOfCreation: InputDate): InputDate => {
  const registrationDate = new Date(`${dateOfCreation.year}-${dateOfCreation.month}-${dateOfCreation.day}`);
  const endOfPeriodDate = new Date(`${endOfPeriod.year}-${endOfPeriod.month}-${endOfPeriod.day}`);
  if (registrationDate > endOfPeriodDate) {
    return endOfPeriod;
  }

  return dateOfCreation;
};

export const getRegistrationDate = (dateOfCreation: InputDate): InputDate => {
  try {
    checkDateValueIsValid("Registration date does not exist.", dateOfCreation.day, dateOfCreation.month, dateOfCreation.year);
    return checkRelevantPeriodDates(dateOfCreation);
  } catch (error) {
    logger.info(error);
    return endOfPeriod;
  }
};
