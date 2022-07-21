import { ApplicationData } from "model";
import { BeneficialOwnerIndividual } from "model/beneficial.owner.individual.model";
import { BeneficialOwnerOther } from "model/beneficial.owner.other.model";
import { BeneficialOwnerItem } from "model/trust.model";

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

export const getBeneficialOwnerList = (appData: ApplicationData): BeneficialOwnerItem[] => {
  const bo_list: BeneficialOwnerItem[]  = [];

  if (appData.beneficial_owners_individual) {
    for (const boi of appData.beneficial_owners_individual) {
      const text: string = boi.first_name + " " + boi.last_name;
      const b: BeneficialOwnerItem = { id: boi.id, name: "beneficialOwners", value: boi.id, text: text };
      bo_list.push(b);
    }
  }
  if (appData.beneficial_owners_corporate) {
    for (const boc of appData.beneficial_owners_corporate) {
      const b: BeneficialOwnerItem = { id: boc.id, name: "beneficialOwners", value: boc.id, text: boc.name || "" };
      bo_list.push(b);
    }
  }

  return bo_list;
};

const containsTrusts = (beneficialOwners: BeneficialOwnerIndividual[] | BeneficialOwnerOther[]): boolean => {
  for (const bo of beneficialOwners) {
    if (bo && bo.trustees_nature_of_control_types && bo.trustees_nature_of_control_types.length > 0) {
      return true;
    }
  }
  return false;
};
