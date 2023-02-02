import { ApplicationData } from "../model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import {
  BeneficialOwnerItem,
  Trust,
  TrustBeneficialOwner,
  TrustHistoricalBeneficialOwner,
  GeneralTrustee,
  TrustKey,
  TrustCorporate,
} from "../model/trust.model";

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

/**
 * Get Trust object from application object in session
 *
 * @param appData Application Data in Session
 * @param trustId Trust details to save
 */
const getTrustByIdFromApp = (appData: ApplicationData, trustId: string): Trust => {
  return appData[TrustKey]?.find(trust => trust.trust_id === trustId) ?? {} as Trust;
};

/**
 * Update trust in application data
 *
 * @param appData Application Data in Session
 * @param trustDetails Trust details to save
 */
const saveTrustInApp = (appData: ApplicationData, trustDetails: Trust): ApplicationData => {
  const trusts: Trust[] = appData[TrustKey] ?? [];

  //  get index of trust in trusts array, if exists
  const trustIndex: number = trusts.findIndex((trust: Trust) => trust.trust_id === trustDetails.trust_id);

  if (trustIndex >= 0) {
    //  get updated trust and remove it from array of trusts
    const updateTrust = trusts.splice(trustIndex, 1).shift() ?? {};

    //  update trust with new details
    trustDetails = {
      ...updateTrust,
      ...trustDetails,
    };
  }

  trusts.push(trustDetails);

  return {
    ...appData,
    [TrustKey]: trusts,
  };
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

const getTrusteesFromTrust = (
  appData: ApplicationData,
  trustId: string,
): GeneralTrustee[] => {
  return appData[TrustKey]?.find(trust =>
    trust?.trust_id === trustId)?.INDIVIDUALS as GeneralTrustee[];
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

const saveHistoricalBoInTrust = (
  trust: Trust,
  boData: TrustHistoricalBeneficialOwner,
): Trust => {
  const bos = trust.HISTORICAL_BO?.filter((bo: TrustHistoricalBeneficialOwner) => bo.id !== boData.id);

  trust.HISTORICAL_BO = [
    ...(bos ?? []),
    boData,
  ];

  return trust;
};

const getLegalEntityBosInTrust = (
  trust: Trust,
): TrustCorporate[] => {

  return trust.CORPORATES ?? [];
};

const saveLegalEntityBoInTrust = (
  trust: Trust,
  legalEntityData: TrustCorporate,
): Trust => {
  const legalEntities = trust.CORPORATES?.filter((legalEntity: TrustCorporate) => legalEntity.id !== legalEntityData.id);

  trust.CORPORATES = [
    ...(legalEntities ?? []),
    legalEntityData,
  ];

  return trust;
};

const saveIndividualTrusteeInTrust = (trust: Trust, trusteeData: GeneralTrustee ): Trust => {
  const trusteeItem = trust.INDIVIDUALS?.filter((trustee) => trustee?.id !== trusteeData?.id);

  trust.INDIVIDUALS = [
    ...(trusteeItem ?? []),
    trusteeData
  ];

  return trust;
};

export {
  checkEntityHasTrusts,
  getBeneficialOwnerList,
  getTrustByIdFromApp,
  saveTrustInApp,
  getBoIndividualAssignableToTrust,
  getBoOtherAssignableToTrust,
  getTrustBoIndividuals,
  getTrustBoOthers,
  getTrusteesFromTrust,
  addTrustToBeneficialOwner,
  removeTrustFromBeneficialOwner,
  saveHistoricalBoInTrust,
  getLegalEntityBosInTrust,
  saveLegalEntityBoInTrust,
  saveIndividualTrusteeInTrust,
};
