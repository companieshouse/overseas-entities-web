import { body } from "express-validator";

// NOSONAR
export const dateValidations = (dateContext: dateContext) => {
  return [

    body(dateContext.dateInput.name)
      .custom((value, { req }) => dateContext.dateInput.callBack(req.body[dateContext.dayInputName], req.body[dateContext.monthInputName], req.body[dateContext.yearInputName])),
  ];
};

// NOSONAR
export const conditionalDateValidations = (dateContextWithCondition: dateContextWithCondition) => {
  return [
    body(dateContextWithCondition.dateInput.name)
      .if(body(dateContextWithCondition.condition.elementName).equals(dateContextWithCondition.condition.expectedValue))
      .custom((value, { req }) => dateContextWithCondition.dateInput.callBack(req.body[dateContextWithCondition.dayInputName], req.body[dateContextWithCondition.monthInputName], req.body[dateContextWithCondition.yearInputName])),
  ];
};

export type dateContext = {
  dayInputName: string,
  monthInputName: string,
  yearInputName: string,
  dateInput: {name: string, callBack: (dayInputValue: string, monthInputValue: string, yearInputValue: string) => boolean},
};

export type dateContextWithCondition = dateContext & {condition: {elementName: string, expectedValue: string}};
