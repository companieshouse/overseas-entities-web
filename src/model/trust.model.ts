import { BeneficialOwnerIndividual } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOther } from '../model/beneficial.owner.other.model';
import { BeneficialOwnerTypeChoice } from '../model/beneficial.owner.type.model';
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
  trust_name: string;
  creation_date_day: string;
  creation_date_month: string;
  creation_date_year: string;
  unable_to_obtain_all_trust_info: string;
  INDIVIDUALS?: TrustIndividual[];
  HISTORICAL_BO?: TrustHistoricalBeneficialOwner[];
  CORPORATES?: TrustCorporate[];
}

interface TrustIndividual {
  id?: string;
  type: RoleWithinTrustType;
  forename: string;
  other_forenames: string;
  surname: string;
  date_of_birth_day: string;
  date_of_birth_month: string;
  date_of_birth_year: string;
  nationality: string;
  second_nationality?: string;
  sa_address_line1: string;
  sa_address_line2?: string;
  sa_address_care_of: string;
  sa_address_country: string;
  sa_address_locality: string;
  sa_address_po_box: string;
  sa_address_postal_code: string;
  sa_address_premises: string;
  sa_address_region?: string;
  ura_address_line1?: string;
  ura_address_line2?: string;
  ura_address_care_of?: string;
  ura_address_country?: string;
  ura_address_locality?: string;
  ura_address_po_box?: string;
  ura_address_postal_code?: string;
  ura_address_premises?: string;
  ura_address_region?: string;
}

export type TrustHistoricalBeneficialOwnerType = BeneficialOwnerTypeChoice.individual | BeneficialOwnerTypeChoice.otherLegal;

interface TrustHistoricalBeneficialOwnerCommon {
  id?: string;
  corporateIndicator: TrustHistoricalBeneficialOwnerType;
  ceased_date_day: string;
  ceased_date_month: string;
  ceased_date_year: string;
  notified_date_day: string;
  notified_date_month: string;
  notified_date_year: string;
}

export type GeneralTrustee = IndividualTrusteeCommon | InterestedIndividualPersonTrustee;

interface IndividualTrusteeCommon extends TrustIndividual{
  type: RoleWithinTrustType.BENEFICIARY | RoleWithinTrustType.GRANTOR | RoleWithinTrustType.SETTLOR;
}

interface InterestedIndividualPersonTrustee extends TrustIndividual{
  type: RoleWithinTrustType.INTERESTED_PERSON;
  date_became_interested_person_day: string;
  date_became_interested_person_month: string;
  date_became_interested_person_year: string;
}

interface TrustHistoricalBeneficialOwnerLegal extends TrustHistoricalBeneficialOwnerCommon {
  corporateName: string;
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
  type: string;
  name: string;
  date_became_interested_person_day?: string;
  date_became_interested_person_month?: string;
  date_became_interested_person_year?: string;
  ro_address_premises: string;
  ro_address_line1: string;
  ro_address_line2?: string;
  ro_address_locality: string;
  ro_address_region: string;
  ro_address_country: string;
  ro_address_postal_code: string;
  ro_address_care_of?: string;
  ro_address_po_box?: string;
  sa_address_premises?: string;
  sa_address_line1?: string;
  sa_address_line2?: string;
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
};


export interface BeneficialOwnerItem {
  id: string
  name: string
  value: string
  text: string
}
