import { ApplicationData } from "../model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import { BeneficialOwnerItem, TrustBeneficialOwner } from "../model/trust.model";

// Checks whether any beneficial owners have trust data
const checkEntityHasTrusts = (appData: ApplicationData): boolean => {
  if (appData) {
    const allBenficialOwnersToCheck: (BeneficialOwnerIndividual[] | BeneficialOwnerOther[] | undefined)[] = [
      appData.beneficial_owners_individual,
      appData.beneficial_owners_corporate,
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

const getBeneficialOwnerList = (appData: ApplicationData): BeneficialOwnerItem[] => {
  const bo_list: BeneficialOwnerItem[] = [];

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
  return beneficialOwners.some(bo => bo.trustees_nature_of_control_types?.length);
};

const getBoIndividualAssignableToTrust = (
  appData: ApplicationData,
): BeneficialOwnerIndividual[] => {
  return (appData[BeneficialOwnerIndividualKey] ?? [])
    .filter((bo: BeneficialOwnerOther) => bo.trustees_nature_of_control_types?.length);
};

const getBoOtherAssignableToTrust = (
  appData: ApplicationData,
): BeneficialOwnerOther[] => {
  return (appData[BeneficialOwnerOtherKey] ?? [])
    .filter((bo: BeneficialOwnerOther) => bo.trustees_nature_of_control_types?.length);
};

const getTrustBoIndividuals = (
  appData: ApplicationData,
  trustId: string,
): BeneficialOwnerIndividual[] => {
  return getBoIndividualAssignableToTrust(appData)
    .filter((bo: BeneficialOwnerIndividual) => bo.trust_ids?.includes(trustId));
};

const getTrustBoOthers = (
  appData: ApplicationData,
  trustId: string,
): BeneficialOwnerOther[] => {

  return getBoOtherAssignableToTrust(appData)
    .filter((bo: BeneficialOwnerIndividual) => bo.trust_ids?.includes(trustId));
};

const addTrustToBeneficialOwner = (
  beneficialOwner: TrustBeneficialOwner,
  trustId: string,
): TrustBeneficialOwner => ({
  ...beneficialOwner,
  trust_ids: [
    ...(beneficialOwner.trust_ids ?? []),
    trustId,
  ],
});

const removeTrustFromBeneficialOwner = (
  beneficialOwner: TrustBeneficialOwner,
  trustId: string,
): TrustBeneficialOwner => ({
  ...beneficialOwner,
  trust_ids: (beneficialOwner.trust_ids ?? []).filter((id: string) => id !== trustId),
});

export {
  checkEntityHasTrusts,
  getBeneficialOwnerList,
  getBoIndividualAssignableToTrust,
  getBoOtherAssignableToTrust,
  getTrustBoIndividuals,
  getTrustBoOthers,
  addTrustToBeneficialOwner,
  removeTrustFromBeneficialOwner,
};
