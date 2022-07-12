export const TrustKey = "trusts";

/*
  The Trust fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const TrustKeys: string[] = [
  "trusts"
];

export interface Trusts {
  trusts: Trust[]
}

export interface Trust {
  trust_id: string;
  trust_name: string;
  creation_date: string;
  unable_to_obtain_all_trust_info: boolean;
  INDIVIDUALS?: TrustIndividual[];
  HISTORICAL_BO?: TrustHistoricalBeneficialOwner[];
  CORPORATES?: TrustCorporate[];
}

interface TrustIndividual {
  type: string;
  forename: string;
  other_forenames: string;
  surname: string;
  date_of_birth: string;
  nationality: string;
  sa_address_line1: string;
  sa_address_line2: string;
  sa_address_care_of: string;
  sa_address_country: string;
  sa_address_locality: string;
  sa_address_po_box: string;
  sa_address_postal_code: string;
  sa_address_premises: string;
  sa_address_region: string;
  ura_address_line1: string;
  ura_address_line2: string;
  ura_address_care_of: string;
  ura_address_country: string;
  ura_address_locality: string;
  ura_address_po_box: string;
  ura_address_postal_code: string;
  ura_address_premises: string;
  ura_address_region: string;
  date_became_interested_person: string;
}

interface TrustHistoricalBeneficialOwner {
  forename: string;
  other_forenames: string;
  surname: string;
  ceased_date: string;
  notified_date: string;
}

interface TrustCorporate {
  type: string;
  name: string;
  date_became_interested_person: string;
  ro_address_line1: string;
  ro_address_line2: string;
  ro_address_care_of: string;
  ro_address_country: string;
  ro_address_locality: string;
  ro_address_po_box: string;
  ro_address_postal_code: string;
  ro_address_premises: string;
  ro_address_region: string;
  sa_address_line1: string;
  sa_address_line2: string;
  sa_address_care_of: string;
  sa_address_country: string;
  sa_address_locality: string;
  sa_address_po_box: string;
  sa_address_postal_code: string;
  sa_address_premises: string;
  sa_address_region: string;
  identification_country_registration: string;
  identification_legal_authority: string;
  identification_legal_form: string;
  identification_place_registered: string;
  identification_registration_number: string;
}

export interface BeneficialOwnerItem {
  id: string
  name: string
  value: string
  text: string
}
