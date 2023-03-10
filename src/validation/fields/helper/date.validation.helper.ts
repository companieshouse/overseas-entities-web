import { body } from "express-validator";
import { ErrorMessages } from "../../../validation/error.messages";

// NOSONAR
export const dateValidations = (dateContext: dateContext) => {
  return [

    body(dateContext.dateInput.name)
      .custom((value, { req }) => dateContext.dateInput.callBack(req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
  ];
};

// NOSONAR
export const conditionalDateValidations = (dateContextWithCondition: dateContextWithCondition) => {
  return [
    body(dateContextWithCondition.dateInput.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .custom((value, { req }) => dateContextWithCondition.dateInput.callBack(req.body[dateContextWithCondition.day.name], req.body[dateContextWithCondition.month.name], req.body[dateContextWithCondition.year.name])),
  ];
};

export type dateContext = {
  day: {name: string, errMsg: ErrorMessages[], callBack: (err: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean}
  month: {name: string, errMsg: ErrorMessages[], callBack: (err: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean},
  year: {name: string, errMsg: ErrorMessages[], callBack: (err1: ErrorMessages, err2: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean},
  dateInput: {name: string, errMsg: ErrorMessages[], callBack: (dayValue: string, monthValue: string, yearValue: string) => boolean},
};

export type dateContextWithCondition = dateContext & {condition: {elementName: string, expectedValue: string}};
