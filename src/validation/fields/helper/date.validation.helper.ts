import { body } from "express-validator";
import { ErrorMessages } from "../../../validation/error.messages";

export const dateValidations = (dateContext: dateContext, min: number, max: number) => {
  return [
    body(dateContext.day.name)
      .if(body(dateContext.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContext.day.callBack(dateContext.day.errMsg[0], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.month.name)
      .if(body(dateContext.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContext.month.callBack(dateContext.month.errMsg[0], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.year.name)
      .custom((value, { req }) => dateContext.year.callBack(dateContext.year.errMsg[0], dateContext.day.errMsg[1], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.dateInput.name)
      .custom((value, { req }) => dateContext.dateInput.callBack(req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
  ];
};

export const conditionalDateValidations = (dateContext: dateContext, min: number, max: number) => {
  return [
    body(dateContext.day.name)
      .if(body(dateContext.day.condition!.elementName).equals(dateContext.day.condition!.expectedValue))
      .if(body(dateContext.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContext.day.callBack(dateContext.day.errMsg[0], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.month.name)
      .if(body(dateContext.month.condition!.elementName).equals(dateContext.month.condition!.expectedValue))
      .if(body(dateContext.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContext.month.callBack(dateContext.month.errMsg[0], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.year.name)
      .if(body(dateContext.year.condition!.elementName).equals(dateContext.year.condition!.expectedValue))
      .custom((value, { req }) => dateContext.year.callBack(dateContext.year.errMsg[0], dateContext.day.errMsg[1], req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.dateInput.name)
      .if(body(dateContext.dateInput.condition!.elementName).equals(dateContext.dateInput.condition!.expectedValue))
      .custom((value, { req }) => dateContext.dateInput.callBack(req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
  ];
};

export type dateContext = {
  day: {name: string, errMsg: ErrorMessages[], callBack: (err: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean, condition?: {elementName: string, expectedValue: string}}
  month: {name: string, errMsg: ErrorMessages[], callBack: (err: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean, condition?: {elementName: string, expectedValue: string}},
  year: {name: string, errMsg: ErrorMessages[], callBack: (err1: ErrorMessages, err2: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean, condition?: {elementName: string, expectedValue: string}},
  dateInput: {name: string, errMsg: ErrorMessages[], callBack: (dayValue: string, monthValue: string, yearValue: string) => boolean, condition?: {elementName: string, expectedValue: string}},
};
