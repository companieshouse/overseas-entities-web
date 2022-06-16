import { ApplicationData } from "model";

// Checks whether any beneficial owners have trust data
export const checkEntityHasTrusts = (appData: ApplicationData): boolean => {

  if (appData !== null) {
    if (appData.beneficial_owners_individual !== undefined) {
      appData.beneficial_owners_individual.forEach(element => {
        if (element.trustees_nature_of_control_types !== undefined && element.trustees_nature_of_control_types.length > 0) {
          return true;
        }
      });
    }

    if (appData.beneficial_owners_corporate !== undefined) {
      appData.beneficial_owners_corporate.forEach(element => {
        if (element.trustees_nature_of_control_types !== undefined && element.trustees_nature_of_control_types.length > 0) {
          return true;
        }
      });
    }
  }
  return false;

};
