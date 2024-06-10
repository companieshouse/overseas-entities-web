import { InputDate } from "../../model/data.types.model";
import { checkDateValueIsValid } from "../../validation/custom.validation";
import { logger } from "../../utils/logger";

const startDate: InputDate = {
  day: "28",
  month: "02",
  year: "2022"
};
const endOfPeriod: InputDate = {
  day: "31",
  month: "01",
  year: "2023"
};

const checkRelevantPeriodDates = (dateOfCreation: InputDate): InputDate => {
  const registrationDate = new Date(`${dateOfCreation.year}-${dateOfCreation.month}-${dateOfCreation.day}`);
  const endOfPeriodDate = new Date(`${endOfPeriod.year}-${endOfPeriod.month}-${endOfPeriod.day}`);
  const beginDate = new Date(`${startDate.year}-${startDate.month}-${startDate.day}`);

  if (registrationDate >= beginDate && registrationDate <= endOfPeriodDate) {
    return dateOfCreation;
  }
  return endOfPeriod;
};

export const getRegistrationDate = (dateOfCreation: InputDate): InputDate => {
  try {
    checkDateValueIsValid("Registration date does not exist.", endOfPeriod.day, endOfPeriod.month, endOfPeriod.year);
    return checkRelevantPeriodDates(endOfPeriod);
  } catch (error) {
    logger.info(error);
    return dateOfCreation;
  }
};
