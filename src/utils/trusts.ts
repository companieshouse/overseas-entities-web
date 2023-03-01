import { CHECK_YOUR_ANSWERS_URL, TRUST_DETAILS_URL, TRUST_INTERRUPT_URL } from "../config";
import { ApplicationData } from "../model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../model/beneficial.owner.individual.model";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from "../model/beneficial.owner.other.model";
import {
  BeneficialOwnerItem,
  Trust,
  TrustBeneficialOwner,
  TrustHistoricalBeneficialOwner,
  IndividualTrustee,
  TrustKey,
  TrustCorporate,
} from "../model/trust.model";

/**
 * Checks whether any beneficial owners requires trust data due to at least one of them
 * having a trustee "nature of control" of the overseas entity
 *
 * @param appData Application Data
 * @returns 'true' if any BO has a trustee "nature of control"
 */
const checkEntityRequiresTrusts = (appData: ApplicationData): boolean => {
  if (appData) {
    const allBenficialOwnersToCheck = beneficialOwnersThatCanBeTrustees(appData);

    for (const benficialOwners of allBenficialOwnersToCheck) {
      if (benficialOwners) {
        if (containsTrusteeNatureOfControl(benficialOwners)) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Return the correct first Trust page in the trust journey depending
 * on whether there is already any trust data.
 *
 * @param appData Application Data
 * @returns string URL to go to when starting the trust journey
 */
const getTrustLandingUrl = (appData: ApplicationData): string => {

  const allBenficialOwnersToCheck = beneficialOwnersThatCanBeTrustees(appData);

  for (const benficialOwners of allBenficialOwnersToCheck) {
    if (benficialOwners) {
      if (containsTrustData(benficialOwners)) {
        // Once naviation changes are agreed the following will change
        return `${CHECK_YOUR_ANSWERS_URL}`;
      }
    }
  }

  return `${TRUST_DETAILS_URL}${TRUST_INTERRUPT_URL}`;
};

const beneficialOwnersThatCanBeTrustees = (appData: ApplicationData): (BeneficialOwnerIndividual[] | BeneficialOwnerOther[] | undefined)[] => {
  return [
    appData.beneficial_owners_individual,
    appData.beneficial_owners_corporate,
  ];
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

const containsTrusteeNatureOfControl = (beneficialOwners: BeneficialOwnerIndividual[] | BeneficialOwnerOther[]): boolean => {
  return beneficialOwners.some(bo => bo.trustees_nature_of_control_types?.length);
};

const containsTrustData = (beneficialOwners: BeneficialOwnerIndividual[] | BeneficialOwnerOther[]): boolean => {
  return beneficialOwners.some(bo => bo.trust_ids?.length);
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
 * Get Trust array from application object in session
 *
 * @param appData Application Data in Session
 */
const getTrustArray = (appData: ApplicationData): Trust[] => {
  return appData[TrustKey] ?? [];
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
    //  update existing trust in array
    trusts[trustIndex] = trustDetails;

  } else {
    // add new trust to array
    trusts.push(trustDetails);
  }

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

/**
 *
 * @param appData Application model type ApplicationData from session
 * @param trustId interested trust Id type string - optional
 * @returns IndividualTrustee type
 */
const getIndividualTrusteesFromTrust = (
  appData: ApplicationData,
  trustId?: string,
): IndividualTrustee[] => {
  let individuals: IndividualTrustee[] = [];
  if (trustId) {
    individuals = appData[TrustKey]?.find(trust =>
      trust?.trust_id === trustId)?.INDIVIDUALS as IndividualTrustee[];
  } else {
    appData[TrustKey]?.map(trust => trust.INDIVIDUALS?.map(individual => {
      individuals.push(individual as IndividualTrustee);
    }));
  }
  return individuals;
};

const getFormerTrusteesFromTrust = (
  appData: ApplicationData,
  trustId?: string,
): TrustHistoricalBeneficialOwner[] => {
  let formerTrustees: TrustHistoricalBeneficialOwner[] = [];
  if (trustId) {
    formerTrustees = appData[TrustKey]?.find(trust =>
      trust?.trust_id === trustId)?.HISTORICAL_BO as TrustHistoricalBeneficialOwner[];
  } else {
    appData[TrustKey]?.map(trust => trust.HISTORICAL_BO?.map(formerTrustee => {
      formerTrustees.push(formerTrustee as TrustHistoricalBeneficialOwner);
    }));
  }
  return formerTrustees;
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

const saveIndividualTrusteeInTrust = (trust: Trust, trusteeData: IndividualTrustee ): Trust => {
  const trusteeItem = trust.INDIVIDUALS?.filter((trustee) => trustee?.id !== trusteeData?.id);

  trust.INDIVIDUALS = [
    ...(trusteeItem ?? []),
    trusteeData
  ];

  return trust;
};

export {
  checkEntityRequiresTrusts,
  getBeneficialOwnerList,
  getTrustByIdFromApp,
  getTrustArray,
  saveTrustInApp,
  getBoIndividualAssignableToTrust,
  getBoOtherAssignableToTrust,
  getTrustBoIndividuals,
  getTrustBoOthers,
  getIndividualTrusteesFromTrust,
  getFormerTrusteesFromTrust,
  addTrustToBeneficialOwner,
  removeTrustFromBeneficialOwner,
  saveHistoricalBoInTrust,
  getLegalEntityBosInTrust,
  saveLegalEntityBoInTrust,
  saveIndividualTrusteeInTrust,
  getTrustLandingUrl,
};
