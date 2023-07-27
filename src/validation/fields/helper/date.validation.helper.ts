import { body } from "express-validator";
import { DayFieldErrors, MonthFieldErrors, YearFieldErrors, checkDayFieldForErrors, checkMonthFieldForErrors, checkYearFieldForErrors } from "../../custom.validation";

// Need to trim leading zeros before custom validations as these reference day month year fields.
export const dateValidations = (dateContext: dateContext) => {
  return [
    body(dateContext.dayInput.name)
      .ltrim("0"),
    body(dateContext.monthInput.name)
      .ltrim("0"),
    body(dateContext.yearInput.name)
      .ltrim("0"),
    body(dateContext.dayInput.name)
      .if(body(dateContext.monthInput.name).notEmpty({ ignore_whitespace: true }))
      .if(body(dateContext.yearInput.name).notEmpty({ ignore_whitespace: true }))
      .custom((value, { req }) => checkDayFieldForErrors(dateContext.dayInput.errors, req.body[dateContext.dayInput.name])),
    body(dateContext.monthInput.name)
      .if(body(dateContext.dayInput.name).notEmpty({ ignore_whitespace: true }))
      .if(body(dateContext.yearInput.name).notEmpty({ ignore_whitespace: true }))
      .custom((value, { req }) => checkMonthFieldForErrors(dateContext.monthInput.errors, req.body[dateContext.monthInput.name])),
    body(dateContext.yearInput.name)
      .if(body(dateContext.dayInput.name).notEmpty({ ignore_whitespace: true }))
      .if(body(dateContext.monthInput.name).notEmpty({ ignore_whitespace: true }))
      .custom((value, { req }) => checkYearFieldForErrors(dateContext.yearInput.errors, req.body[dateContext.yearInput.name])),
    body(dateContext.dayInput.name)
      .custom((value, { req }) => dateContext.dateInput.callBack(req.body[dateContext.dayInput.name], req.body[dateContext.monthInput.name], req.body[dateContext.yearInput.name])),
  ];
};

// Need to trim leading zeros before custom validations as these reference day month year fields.
export const conditionalDateValidations = (dateContextWithCondition: dateContextWithCondition) => {
  return [
    body(dateContextWithCondition.dayInput.name)
      .ltrim("0"),
    body(dateContextWithCondition.monthInput.name)
      .ltrim("0"),
    body(dateContextWithCondition.yearInput.name)
      .ltrim("0"),
    body(dateContextWithCondition.dayInput.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .if(body(dateContextWithCondition.monthInput.name).notEmpty({ ignore_whitespace: true }))
      .if(body(dateContextWithCondition.yearInput.name).notEmpty({ ignore_whitespace: true }))
      .custom((value, { req }) => checkDayFieldForErrors(dateContextWithCondition.dayInput.errors, req.body[dateContextWithCondition.dayInput.name])),
    body(dateContextWithCondition.monthInput.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .if(body(dateContextWithCondition.dayInput.name).notEmpty({ ignore_whitespace: true }))
      .if(body(dateContextWithCondition.yearInput.name).notEmpty({ ignore_whitespace: true }))
      .custom((value, { req }) => checkMonthFieldForErrors(dateContextWithCondition.monthInput.errors, req.body[dateContextWithCondition.monthInput.name])),
    body(dateContextWithCondition.yearInput.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .if(body(dateContextWithCondition.dayInput.name).notEmpty({ ignore_whitespace: true }))
      .if(body(dateContextWithCondition.monthInput.name).notEmpty({ ignore_whitespace: true }))
      .custom((value, { req }) => checkYearFieldForErrors(dateContextWithCondition.yearInput.errors, req.body[dateContextWithCondition.yearInput.name])),
    body(dateContextWithCondition.dayInput.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .custom((value, { req }) => dateContextWithCondition.dateInput.callBack(req.body[dateContextWithCondition.dayInput.name], req.body[dateContextWithCondition.monthInput.name], req.body[dateContextWithCondition.yearInput.name])),
  ];
};

export type dateContext = {
  dayInput: {name: string, errors: DayFieldErrors},
  monthInput: {name: string, errors: MonthFieldErrors},
  yearInput: {name: string, errors: YearFieldErrors},
  dateInput: {name: string, callBack: (dayInputValue: string, monthInputValue: string, yearInputValue: string) => boolean},
};

export type dateContextWithCondition = dateContext & {condition: {elementName: string, expectedValue: string}};
