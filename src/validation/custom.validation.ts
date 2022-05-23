// Custom validation utils - For now checking is not empty

export const checkFieldIfRadioButtonSelected = (selected: boolean, value: string = "", errMsg: string) => {
  if ( selected && !value.trim() ) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDate = (day: string = "", month: string = "", year: string = "", errMsg: string) => {
  if ( !day.trim() || !month.trim() || !year.trim() ) {
    throw new Error(errMsg);
  }
  return true;
};
