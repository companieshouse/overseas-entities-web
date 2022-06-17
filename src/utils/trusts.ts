import { ApplicationData } from "model";
import { BeneficialOwnerIndividual } from "model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "model/beneficial.owner.other.model";

// Checks whether any beneficial owners have trust data
export const checkEntityHasTrusts = (appData: ApplicationData): boolean => {
  if (appData) {
    const allBenficialOwnersToCheck: (BeneficialOwnerIndividual[] | BeneficialOwnerOther[] | undefined)[] = [
      appData.beneficial_owners_individual,
      appData.beneficial_owners_corporate
    ];

    for (const benficialOwners of allBenficialOwnersToCheck) {
      if (benficialOwners) {
        if (containsTrusts(benficialOwners)) {
          return true;
        }
      }
    }
  }
  return false;
};

const containsTrusts = (beneficialOwners: BeneficialOwnerIndividual[] | BeneficialOwnerOther[]): boolean => {
  for (const bo of beneficialOwners) {
    if (bo && bo.trustees_nature_of_control_types && bo.trustees_nature_of_control_types.length > 0) {
      return true;
    }
  }
  return false;
};
