import { v4 as uuidv4 } from "uuid";
import { TRUST_DETAILS_URL, TRUST_INTERRUPT_URL, TRUST_ENTRY_URL, ADD_TRUST_URL } from "../config";
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
  TrustIndividual,
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

  if (containsTrustData(getTrustArray(appData))) {
    // Once naviation changes are agreed the following will change
    return `${TRUST_ENTRY_URL + ADD_TRUST_URL}`;
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

const containsTrustData = (trusts: Trust[]): boolean => {
  return (trusts.length > 0);
};

/**
 * Get Trust object from application object in session
 *
 * @param appData Application Data in Session
 * @param trustId Trust ID find (returns empty object if not found)
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
 * @param trustToSave Trust (with any trustees) to save
 */
const saveTrustInApp = (appData: ApplicationData, trustToSave: Trust): ApplicationData => {
  const trusts: Trust[] = appData[TrustKey] ?? [];

  //  get index of trust in trusts array, if exists
  const trustIndex: number = trusts.findIndex((trust: Trust) => trust.trust_id === trustToSave.trust_id);

  if (trustIndex >= 0) {
    //  update existing trust in array
    trusts[trustIndex] = trustToSave;

  } else {
    // add new trust to array
    trusts.push(trustToSave);
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
    if (individuals === undefined){
      individuals = [] as IndividualTrustee[];
    }
  } else {
    appData[TrustKey]?.map(trust => trust.INDIVIDUALS?.map(individual => {
      individuals.push(individual as IndividualTrustee);
    }));
  }
  return individuals;
};

const getIndividualTrustee = (
  appData: ApplicationData,
  trustId: string,
  trusteeId?: string,
): IndividualTrustee => {
  const individualTrustees = getIndividualTrusteesFromTrust(appData, trustId);

  if (individualTrustees.length === 0 || trusteeId === undefined) {
    return {} as IndividualTrustee;
  }
  return individualTrustees.find(trustee => trustee.id === trusteeId) ?? {} as IndividualTrustee;
};

const getFormerTrusteesFromTrust = (
  appData: ApplicationData,
  trustId?: string,
): TrustHistoricalBeneficialOwner[] => {
  let formerTrustees: TrustHistoricalBeneficialOwner[] = [];
  if (trustId) {
    formerTrustees = appData[TrustKey]?.find(trust =>
      trust?.trust_id === trustId)?.HISTORICAL_BO as TrustHistoricalBeneficialOwner[];
    if (formerTrustees === undefined) {
      formerTrustees = [] as TrustHistoricalBeneficialOwner[];
    }
  }
  return formerTrustees;
};

const getFormerTrustee = (
  appData: ApplicationData,
  trustId: string,
  trusteeId?: string,
): TrustHistoricalBeneficialOwner => {
  const formerTrustees = getFormerTrusteesFromTrust(appData, trustId);

  if (formerTrustees.length === 0 || trusteeId === undefined) {
    return {} as TrustHistoricalBeneficialOwner;
  }

  return formerTrustees.find(trustee => trustee.id === trusteeId) ?? {} as TrustHistoricalBeneficialOwner;
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
  appData: ApplicationData,
  trustId?: string,
): TrustCorporate[] => {
  let legalEntities: TrustCorporate[] = [];
  if (trustId) {
    legalEntities = appData[TrustKey]?.find(trust =>
      trust?.trust_id === trustId)?.CORPORATES as TrustCorporate[];
    if (legalEntities === undefined) {
      legalEntities = [] as TrustCorporate[];
    }
  }
  return legalEntities;
};

const getLegalEntityTrustee = (
  appData: ApplicationData,
  trustId: string,
  trusteeId?: string,
): TrustCorporate => {
  const legalEntityTrustees = getLegalEntityBosInTrust(appData, trustId);

  if (legalEntityTrustees.length === 0 || trusteeId === undefined) {
    return {} as TrustCorporate;
  }
  return legalEntityTrustees.find(trustee => trustee.id === trusteeId) ?? {} as TrustCorporate;
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

/**
 * The Trustee Ids are NOT part of the OE API data model nor part of the SDK mapper object. They need
 * to be generated when the Trust Data is got from the API (e.g. for a "Save and Resume" journey)
 * @param appData - application data
 * @returns void
 */
const generateTrusteeIds = (appData: ApplicationData) => {

  if (containsTrustData(getTrustArray(appData))) {

    for (const trust of appData.trusts ?? []) {

      trust.CORPORATES = (trust.CORPORATES as TrustCorporate[]).map( te => {return { ...te, id: uuidv4() }; } );
      trust.HISTORICAL_BO = (trust.HISTORICAL_BO as TrustHistoricalBeneficialOwner[]).map( te => {return { ...te, id: uuidv4() }; } );
      trust.INDIVIDUALS = (trust.INDIVIDUALS as TrustIndividual[]).map( te => {return { ...te, id: uuidv4() }; } );

    }
  }
};

/*
"usual_residential_address\":{\"property_name_number\":\"3\",\"line_1\":\"Haupt Strasse\",\"line_2\":\"Zeite Linie\",\"county\":\"\",\"locality\":\"Neustadt\",\"country\":\"Afghanistan\",\"po_box\":\"\",\"care_of\":\"\",\"postcode\":\"12345\"

"service_address\":{\"property_name_number\":\"1\",\"line_1\":\"Correspondence Road\",\"line_2\":\"line 2\",\"county\":\"county \",\"locality\":\"Testville\",\"country\":\"Afghanistan\",\"po_box\":\"\",\"care_of\":\"\",\"postcode\":\"CpX3wyAyWr\"}

        if (apiData.hasOwnProperty("usual_residential_address"))

        )

*/

/**
 * The API sends trustee address data in address objects but the web needs it in flat fields. This needs to be called
 * when the Trust Data is got from the API (e.g. for a "Save and Resume" journey)
 *
 * @param appData  - application data
 * @returns void
 */
const mapTrusteeAddressesFromApiToWebModel = (appData: ApplicationData) => {

  if (containsTrustData(getTrustArray(appData))) {

    for (const trust of appData.trusts ?? []) {

      trust.INDIVIDUALS = (trust.INDIVIDUALS || []).map(trustIndividual => {

        const apiData: any = trustIndividual;

        return {
          id: apiData.id,
          type: apiData.RoleWithinTrustType,
          forename: apiData.forename,
          other_forenames: apiData.other_forenames,
          surname: apiData.surname,
          date_of_birth_day: apiData.date_of_birth_day,
          date_of_birth_month: apiData.date_of_birth_month,
          date_of_birth_year: apiData.date_of_birth_year,
          nationality: apiData.nationality,
          ura_address_premises: apiData.usual_residential_address?.property_name_number,
          ura_address_line_1: apiData.usual_residential_address?.line_1,
          ura_address_line_2: apiData.usual_residential_address?.line_2,
          ura_address_locality: apiData.usual_residential_address?.locality,
          ura_address_region: apiData.usual_residential_address?.county,
          ura_address_country: apiData.usual_residential_address?.country,
          ura_address_postal_code: apiData.usual_residential_address?.postcode,
          is_service_address_same_as_usual_residential_address: apiData.is_service_address_same_as_usual_residential_address,
          sa_address_premises: apiData.service_address?.property_name_number,
          sa_address_line_1: apiData.service_address?.line_1,
          sa_address_line_2: apiData.service_address?.line_2,
          sa_address_locality: apiData.service_address?.locality,
          sa_address_region: apiData.service_address?.county,
          sa_address_country: apiData.service_address?.country,
          sa_address_postal_code: apiData.service_address?.postcode,
          date_became_interested_person_day: apiData?.date_became_interested_person_day,
          date_became_interested_person_month: apiData?.date_became_interested_person_month,
          date_became_interested_person_year: apiData?.date_became_interested_person_year,
        };
      });

      trust.CORPORATES = (trust.CORPORATES as TrustCorporate[]).map( te => {return { ...te, id: uuidv4() }; } );

      // trust.INDIVIDUALS = (trust.INDIVIDUALS as TrustIndividual[]).map( te => {return { ...te, id: uuidv4() }; } );

    }

  }
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
  getFormerTrustee,
  addTrustToBeneficialOwner,
  removeTrustFromBeneficialOwner,
  saveHistoricalBoInTrust,
  getLegalEntityBosInTrust,
  saveLegalEntityBoInTrust,
  saveIndividualTrusteeInTrust,
  getTrustLandingUrl,
  containsTrustData,
  getIndividualTrustee,
  generateTrusteeIds,
  getLegalEntityTrustee,
  mapTrusteeAddressesFromApiToWebModel,
};
