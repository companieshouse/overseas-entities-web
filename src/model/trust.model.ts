import { BeneficialOwnerIndividual } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOther } from '../model/beneficial.owner.other.model';
import { BeneficialOwnerTypeChoice } from '../model/beneficial.owner.type.model';
import { yesNoResponse } from './data.types.model';
import { RoleWithinTrustType } from './role.within.trust.type.model';

export const TrustKey = "trusts";

/*
  The Trust fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const TrustKeys: string[] = [
  "trusts",
];

export interface Trusts {
  trusts: Trust[]
}

export type TrustBeneficialOwner = ( BeneficialOwnerOther | BeneficialOwnerIndividual ) & {
  type?: BeneficialOwnerTypeChoice.individual | BeneficialOwnerTypeChoice.otherLegal;
  name?: string;
};

export interface Trust {
  trust_id: string;
  ch_reference?: string;
  trust_name: string;
  creation_date_day: string;
  creation_date_month: string;
  creation_date_year: string;
  unable_to_obtain_all_trust_info: string; // "Yes" or "No" required on the spreadsheet solution so we can NOT use yesNoResponse
  INDIVIDUALS?: TrustIndividual[];
  HISTORICAL_BO?: TrustHistoricalBeneficialOwner[];
  CORPORATES?: TrustCorporate[];
  review_status?: TrustReviewStatus;
}

export interface TrustReviewStatus {
  in_review: boolean;
  reviewed_trust_details: boolean;
  reviewed_former_bos: boolean;
  reviewed_individuals: boolean;
  reviewed_legal_entities: boolean;
}

export interface TrustIndividual {
  id?: string;
  ch_references?: string;
  type: RoleWithinTrustType;
  forename: string;
  other_forenames: string;
  surname: string;
  dob_day: string;
  dob_month: string;
  dob_year: string;
  nationality: string;
  second_nationality?: string;
  ura_address_premises: string;
  ura_address_line_1: string;
  ura_address_line_2?: string;
  ura_address_locality: string;
  ura_address_region?: string;
  ura_address_country: string;
  ura_address_postal_code: string;
  ura_address_care_of?: string;
  ura_address_po_box?: string;
  sa_address_premises?: string;
  sa_address_line_1?: string;
  sa_address_line_2?: string;
  sa_address_locality?: string;
  sa_address_region?: string;
  sa_address_country?: string;
  sa_address_postal_code?: string;
  sa_address_care_of?: string;
  sa_address_po_box?: string;
}

interface TrustHistoricalBeneficialOwnerCommon {
  id?: string;
  ch_references?: string;
  corporate_indicator: yesNoResponse;
  ceased_date_day: string;
  ceased_date_month: string;
  ceased_date_year: string;
  notified_date_day: string;
  notified_date_month: string;
  notified_date_year: string;
}

export type IndividualTrustee = (NonInterestedIndividualPersonTrustee | InterestedIndividualPersonTrustee) &
{ is_service_address_same_as_usual_residential_address: yesNoResponse };

interface NonInterestedIndividualPersonTrustee extends TrustIndividual{
  type: RoleWithinTrustType.BENEFICIARY | RoleWithinTrustType.GRANTOR | RoleWithinTrustType.SETTLOR;
}

export interface InterestedIndividualPersonTrustee extends TrustIndividual {
  type: RoleWithinTrustType.INTERESTED_PERSON;
  date_became_interested_person_day: string;
  date_became_interested_person_month: string;
  date_became_interested_person_year: string;
}

interface TrustHistoricalBeneficialOwnerLegal extends TrustHistoricalBeneficialOwnerCommon {
  corporate_name: string;
}

interface TrustHistoricalBeneficialOwnerIndividual extends TrustHistoricalBeneficialOwnerCommon {
  forename: string;
  other_forenames?: string;
  surname: string;
}

export type TrustHistoricalBeneficialOwner =
  TrustHistoricalBeneficialOwnerLegal
  | TrustHistoricalBeneficialOwnerIndividual;

export type TrustCorporate = {
  id?: string
  ch_references?: string;
  type: string;
  name: string;
  date_became_interested_person_day?: string;
  date_became_interested_person_month?: string;
  date_became_interested_person_year?: string;
  ro_address_premises: string;
  ro_address_line_1: string;
  ro_address_line_2?: string;
  ro_address_locality: string;
  ro_address_region: string;
  ro_address_country: string;
  ro_address_postal_code: string;
  ro_address_care_of?: string;
  ro_address_po_box?: string;
  sa_address_premises?: string;
  sa_address_line_1?: string;
  sa_address_line_2?: string;
  sa_address_locality?: string;
  sa_address_region?: string;
  sa_address_country?: string;
  sa_address_postal_code?: string;
  sa_address_care_of?: string;
  sa_address_po_box?: string;
  identification_legal_authority: string;
  identification_legal_form: string;
  identification_place_registered?: string;
  identification_country_registration?: string;
  identification_registration_number?: string;
  is_service_address_same_as_principal_address: yesNoResponse;
  is_on_register_in_country_formed_in: yesNoResponse;
};

export interface BeneficialOwnerItem {
  id: string
  name: string
  value: string
  text: string
}
