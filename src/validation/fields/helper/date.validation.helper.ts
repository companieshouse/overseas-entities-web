import { body } from "express-validator";
import { ErrorMessages } from "../../../validation/error.messages";

export const dateValidations = (dateContext: dateContext, min: number, max: number) => {
  return [
    body(dateContext.day.name)
      .if(body(dateContext.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContext.day.callBack(ErrorMessages.DAY, req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.month.name)
      .if(body(dateContext.year.name).isLength({ min: min, max: max }))
      .custom((value, { req }) => dateContext.month.callBack(ErrorMessages.MONTH, req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.year.name)
      .custom((value, { req }) => dateContext.year.callBack(ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH, req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
    body(dateContext.dateInput.name)
      .custom((value, { req }) => dateContext.dateInput.callBack(req.body[dateContext.day.name], req.body[dateContext.month.name], req.body[dateContext.year.name])),
  ];
};

export type dateContext = {
  day: {name: string, callBack: (err: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean}
  month: {name: string, callBack: (err: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean},
  year: {name: string, callBack: (err1: ErrorMessages, err2: ErrorMessages, dayValue: string, monthValue: string, yearValue: string) => boolean},
  dateInput: {name: string, callBack: (dayValue: string, monthValue: string, yearValue: string) => boolean},
};
