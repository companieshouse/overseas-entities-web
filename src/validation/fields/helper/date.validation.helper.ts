import { body } from "express-validator";
import { ErrorMessages } from "../../../validation/error.messages";

// NOSONAR
export const dateValidations = (dateContext: dateContext, min: number, max: number) => {
  return [
    body(dateContext.day.name)
      .if(body(dateContext.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContext.day.callBack(dateContext.day.errMsg[0], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name]))
      .isLength({ min: 1, max: 2 }).withMessage(ErrorMessages.DAY_LENGTH),
    body(dateContext.month.name)
      .if(body(dateContext.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContext.month.callBack(dateContext.month.errMsg[0], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name]))
      .isLength({ min: 1, max: 2 }).withMessage(ErrorMessages.MONTH_LENGTH),
    body(dateContext.year.name)
      .custom((value, { req }) => dateContext.year.callBack(dateContext.year.errMsg[0], dateContext.day.errMsg[1], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.dateInput.name)
      .custom((value, { req }) => dateContext.dateInput.callBack(req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
  ];
};

// NOSONAR
export const conditionalDateValidations = (dateContextWithCondition: dateContextWithCondition, min: number, max: number) => {
  return [
    body(dateContextWithCondition.day.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .if(body(dateContextWithCondition.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContextWithCondition.day.callBack(dateContextWithCondition.day.errMsg[0], req.body[dateContextWithCondition.day.name], req.body[dateContextWithCondition.month.name], req.body[dateContextWithCondition.year.name]))
      .isLength({ min: 1, max: 2 }).withMessage(ErrorMessages.DAY_LENGTH),
    body(dateContextWithCondition.month.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .if(body(dateContextWithCondition.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContextWithCondition.month.callBack(dateContextWithCondition.month.errMsg[0], req.body[dateContextWithCondition.day.name], req.body[dateContextWithCondition.month.name], req.body[dateContextWithCondition.year.name]))
      .isLength({ min: 1, max: 2 }).withMessage(ErrorMessages.MONTH_LENGTH),
    body(dateContextWithCondition.year.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .custom((value, { req }) => dateContextWithCondition.year.callBack(dateContextWithCondition.year.errMsg[0], dateContextWithCondition.day.errMsg[1], req.body[dateContextWithCondition.day.name], req.body[dateContextWithCondition.month.name], req.body[dateContextWithCondition.year.name])),
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
