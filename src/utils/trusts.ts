import { Request } from "express";
import { RoleWithinTrustType } from "../model/role.within.trust.type.model";
import { v4 as uuidv4 } from "uuid";
import * as config from "../config";
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
import { yesNoResponse } from "../model/data.types.model";
import { isActiveFeature } from "./feature.flag";
import { getUrlWithParamsToPath } from "./url";
import { ReviewTrustKey, UpdateKey } from "../model/update.type.model";

/**
 * Checks whether any beneficial owners requires trust data due to at least one of them
 * having a trustee "nature of control" of the overseas entity
 *
 * @param appData Application Data
 * @returns 'true' if any BO has a trustee "nature of control"
 */
const checkEntityRequiresTrusts = (appData: ApplicationData | undefined): boolean => {
  if (!appData) {
    return false;
  }
  return containsTrusteeNatureOfControl(appData.beneficial_owners_individual ?? []) ||
    containsTrusteeNatureOfControl(appData.beneficial_owners_corporate ?? []);
};

/**
 * Checks whether any beneficial owners requires trust data to review due to at least one of them
 * having a trustee "nature of control" of the overseas entity
 *
 * @param appData Application Data
 * @returns @returns 'true' if any BO requring review has a trustee "nature of control"
 */
const checkEntityReviewRequiresTrusts = (appData: ApplicationData | undefined): boolean => {
  if (!appData?.update) {
    return false;
  }
  return containsTrusteeNatureOfControl(appData.update.review_beneficial_owners_individual ?? []) ||
    containsTrusteeNatureOfControl(appData.update.review_beneficial_owners_corporate ?? []);
};

/**
 * Return the correct first Trust page in the trust journey depending
 * on whether there is already any trust data.
 *
 * @param appData Application Data
 * @returns string URL to go to when starting the trust journey
 */
const getTrustLandingUrl = (appData: ApplicationData, req?: Request): string => { //  TODO MAKE REQ MANDATORY
  if (containsTrustData(getTrustArray(appData))) {
    // Once naviation changes are agreed the following will change
    if (appData.entity_number) {
      return config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL;
    } else {
      let nextPageUrl = `${config.TRUST_ENTRY_URL}${config.ADD_TRUST_URL}`;
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && req){
        nextPageUrl = getUrlWithParamsToPath(`${config.TRUST_ENTRY_WITH_PARAMS_URL}${config.ADD_TRUST_URL}`, req);
      }
      return nextPageUrl;
    }
  }
  if (appData.entity_number) {
    return config.UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL;
  } else {
    let nextPageUrl = `${config.TRUST_DETAILS_URL}${config.TRUST_INTERRUPT_URL}`;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && req){
      nextPageUrl = getUrlWithParamsToPath(`${config.TRUST_ENTRY_WITH_PARAMS_URL}${config.TRUST_INTERRUPT_URL}`, req);
    }
    return nextPageUrl;
  }
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

const containsReviewTrustData = (reviewTrusts: Trust[]): boolean => {
  return (reviewTrusts.length > 0);
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
 * Get Review Trust array from application object in session
 *
 * @param appData Application Data in Session
 */
const getReviewTrustArray = (appData: ApplicationData): Trust[] => {
  return appData?.update?.review_trusts ?? [];
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
    trusts[trustIndex] = trustToSave; //  update existing trust in array
  } else {
    trusts.push(trustToSave); // add new trust to array
  }
  return { ...appData, [TrustKey]: trusts, };
};

const getBoIndividualAssignableToTrust = (
  appData: ApplicationData,
): BeneficialOwnerIndividual[] => {
  return (appData[BeneficialOwnerIndividualKey] ?? [])
    .filter((bo: BeneficialOwnerIndividual) => bo.trustees_nature_of_control_types?.length)
    .filter((bo: BeneficialOwnerIndividual) => Object.keys(bo.ceased_date || {}).length === 0 || bo.relevant_period);
};

const getBoOtherAssignableToTrust = (
  appData: ApplicationData,
): BeneficialOwnerOther[] => {
  return (appData[BeneficialOwnerOtherKey] ?? [])
    .filter((bo: BeneficialOwnerOther) => bo.trustees_nature_of_control_types?.length)
    .filter((bo: BeneficialOwnerOther) => Object.keys(bo.ceased_date || {}).length === 0 || bo.relevant_period);
};

const hasNoBoAssignableToTrust = (appData: ApplicationData): boolean => {
  return [
    ...getBoIndividualAssignableToTrust(appData),
    ...getBoOtherAssignableToTrust(appData)
  ].length === 0;
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
  isReview?: boolean,
): IndividualTrustee[] => {
  let individuals: IndividualTrustee[] = [];
  const trustList = isReview ? appData[UpdateKey]?.[ReviewTrustKey] : appData[TrustKey];
  if (trustId) {
    individuals = trustList?.find(trust =>
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
  isReview?: boolean,
): IndividualTrustee => {
  const individualTrustees = getIndividualTrusteesFromTrust(appData, trustId, isReview);
  if (individualTrustees.length === 0 || trusteeId === undefined) {
    return {} as IndividualTrustee;
  }
  return individualTrustees.find(trustee => trustee.id === trusteeId) ?? {} as IndividualTrustee;
};

const getFormerTrusteesFromTrust = (
  appData: ApplicationData,
  trustId?: string,
  isReview?: boolean,
): TrustHistoricalBeneficialOwner[] => {
  let formerTrustees: TrustHistoricalBeneficialOwner[] = [];
  const trustList = isReview ? appData[UpdateKey]?.[ReviewTrustKey] : appData[TrustKey];
  if (trustId) {
    formerTrustees = trustList?.find(trust =>
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
  isReview?: boolean,
): TrustHistoricalBeneficialOwner => {
  const formerTrustees = getFormerTrusteesFromTrust(appData, trustId, isReview);

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
  isReview?: boolean,
): TrustCorporate[] => {
  let legalEntities: TrustCorporate[] = [];
  const trustList = isReview ? appData[UpdateKey]?.[ReviewTrustKey] : appData[TrustKey];
  if (trustId && trustList) {
    legalEntities = trustList.find(trust =>
      trust?.trust_id === trustId)?.CORPORATES as TrustCorporate[];
    if (legalEntities === undefined) {
      legalEntities = [];
    }
  }
  return legalEntities;
};

const getLegalEntityTrustee = (
  appData: ApplicationData,
  trustId: string,
  trusteeId?: string,
  isReview?: boolean
): TrustCorporate => {
  const legalEntityTrustees = getLegalEntityBosInTrust(appData, trustId, isReview);

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
 * The API returns data in a different type of resource as is sent up to it! This is hard coded in the API
 * with the Node SDK just doing some date mapping.
 *
 * Rather than re-writing the Node SDK and the input part of the API we have this function.
 *
 * For primatives no mapping is required, but note:
 * 1.) The API address structure is different from the Web Address structure and for individual and corporate trustees the
 * API sends the data back in an API address (even though it received them in flat string fields)
 * 2.) yesNoResponse is not an issue and while the JSON is true or false from the API (rather 1 or 0) this works fine and is
 * how things are outside of the trust data
 * 3.) enums need to be converted expicitly (see example below with the `type` property)
 * 4.) the API model does not have trustee id's (and these are not added in the Node SDK) so they are re-generated here
 *
 * This needs to be called when the Trust Data is got from the API (e.g. for a "Save and Resume" journey)
 *
 * @param appData  - application data
 * @returns void
 */
const mapTrustApiReturnModelToWebModel = (appData: ApplicationData) => {

  const trusts = getTrustArray(appData);
  if (containsTrustData(trusts)) {
    for (const trust of trusts ?? []) {
      mapTrustees(trust);
    }
  }

  const reviewTrusts = getReviewTrustArray(appData);
  if (containsReviewTrustData(reviewTrusts)) {
    for (const trust of reviewTrusts ?? []) {
      mapTrustees(trust);
    }
  }
};

const mapTrustees = (trust: Trust) => {
  trust.CORPORATES = (trust?.CORPORATES || []).map(corporateTrustee => {

    const apiData: any = corporateTrustee;

    return {
      id: apiData?.id ?? uuidv4(),
      type: getRoleWithinTrustType(apiData.type) as RoleWithinTrustType,
      name: apiData.name,
      date_became_interested_person_day: apiData?.date_became_interested_person_day,
      date_became_interested_person_month: apiData?.date_became_interested_person_month,
      date_became_interested_person_year: apiData?.date_became_interested_person_year,
      ro_address_premises: apiData.registered_office_address.property_name_number,
      ro_address_line_1: apiData.registered_office_address.line_1,
      ro_address_line_2: apiData?.registered_office_address.line_2,
      ro_address_locality: apiData.registered_office_address.locality,
      ro_address_region: apiData.registered_office_address.county,
      ro_address_country: apiData.registered_office_address.country,
      ro_address_postal_code: apiData.registered_office_address.postcode,
      ro_address_care_of: apiData?.registered_office_address.care_of,
      ro_address_po_box: apiData?.registered_office_address.po_box,
      sa_address_premises: apiData?.service_address.property_name_number,
      sa_address_line_1: apiData.service_address?.line_1,
      sa_address_line_2: apiData.service_address?.line_2,
      sa_address_locality: apiData.service_address?.locality,
      sa_address_region: apiData.service_address?.county,
      sa_address_country: apiData.service_address?.country,
      sa_address_postal_code: apiData.service_address?.postcode,
      sa_address_care_of: apiData.service_address?.care_of,
      sa_address_po_box: apiData.service_address?.po_box,
      identification_legal_authority: apiData.identification_legal_authority,
      identification_legal_form: apiData.identification_legal_form,
      identification_place_registered: apiData?.identification_place_registered,
      identification_country_registration: apiData?.identification_country_registration,
      identification_registration_number: apiData?.identification_registration_number,
      is_service_address_same_as_principal_address: apiData.is_service_address_same_as_principal_address,
      is_on_register_in_country_formed_in: apiData?.is_on_register_in_country_formed_in
    };
  });

  trust.INDIVIDUALS = (trust?.INDIVIDUALS || []).map(trustIndividual => {

    const apiData: any = trustIndividual;

    return {
      id: apiData?.id ?? uuidv4(),
      type: getRoleWithinTrustType(apiData.type) as RoleWithinTrustType,
      forename: apiData.forename,
      other_forenames: apiData.other_forenames,
      surname: apiData.surname,
      dob_day: apiData.dob_day,
      dob_month: apiData.dob_month,
      dob_year: apiData.dob_year,
      nationality: apiData.nationality,
      second_nationality: apiData?.second_nationality,
      ura_address_premises: apiData.usual_residential_address?.property_name_number,
      ura_address_line_1: apiData.usual_residential_address?.line_1,
      ura_address_line_2: apiData.usual_residential_address?.line_2,
      ura_address_locality: apiData.usual_residential_address?.locality,
      ura_address_region: apiData.usual_residential_address?.county,
      ura_address_country: apiData.usual_residential_address?.country,
      ura_address_postal_code: apiData.usual_residential_address?.postcode,
      ura_address_care_of: apiData?.usual_residential_address.care_of,
      ura_address_po_box: apiData?.usual_residential_address.po_box,
      is_service_address_same_as_usual_residential_address: apiData.is_service_address_same_as_usual_residential_address,
      sa_address_premises: apiData.service_address?.property_name_number,
      sa_address_line_1: apiData.service_address?.line_1,
      sa_address_line_2: apiData.service_address?.line_2,
      sa_address_locality: apiData.service_address?.locality,
      sa_address_region: apiData.service_address?.county,
      sa_address_country: apiData.service_address?.country,
      sa_address_postal_code: apiData.service_address?.postcode,
      sa_address_care_of: apiData.service_address?.care_of,
      sa_address_po_box: apiData.service_address?.po_box,
      date_became_interested_person_day: apiData?.date_became_interested_person_day,
      date_became_interested_person_month: apiData?.date_became_interested_person_month,
      date_became_interested_person_year: apiData?.date_became_interested_person_year,
    };
  });

  trust.HISTORICAL_BO = (trust?.HISTORICAL_BO as TrustHistoricalBeneficialOwner[] || []).map(
    hbo => { return { id: hbo?.id ?? uuidv4(), ...hbo, corporate_indicator: convertBooleanToYesNoResponse(hbo.corporate_indicator), }; });
};

function getRoleWithinTrustType(type: any): RoleWithinTrustType | undefined {

  switch (type) {
      case "BENEFICIARY":
      case RoleWithinTrustType.BENEFICIARY:
        return RoleWithinTrustType.BENEFICIARY;
      case "SETTLOR":
      case RoleWithinTrustType.SETTLOR:
        return RoleWithinTrustType.SETTLOR;
      case "GRANTOR":
      case RoleWithinTrustType.GRANTOR:
        return RoleWithinTrustType.GRANTOR;
      case "INTERESTED_PERSON":
      case RoleWithinTrustType.INTERESTED_PERSON:
        return RoleWithinTrustType.INTERESTED_PERSON;
      default:
        break;
  }
  return undefined;
}

function convertBooleanToYesNoResponse(apiYesNoResponse: yesNoResponse): yesNoResponse {
  // used to convert boolean recieved from api to number for yesNoResponse used in web.
  // although true/false is sent by the api, typescript still detects it as a yesNoResponse hence why yesNoResponse is passed to this function

  if (apiYesNoResponse === undefined){
    return yesNoResponse.No;
  }
  return Number(apiYesNoResponse);
}

export {
  checkEntityRequiresTrusts,
  checkEntityReviewRequiresTrusts,
  getBeneficialOwnerList,
  getTrustByIdFromApp,
  getTrustArray,
  saveTrustInApp,
  getBoIndividualAssignableToTrust,
  getBoOtherAssignableToTrust,
  hasNoBoAssignableToTrust,
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
  getLegalEntityTrustee,
  mapTrustApiReturnModelToWebModel,
};
