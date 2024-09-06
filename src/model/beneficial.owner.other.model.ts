import { Address, InputDate, NatureOfControlJurisdiction, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const BeneficialOwnerOtherKey: string = "beneficial_owners_corporate";

/*
  These fields should match the name field on the HTML file to be able to do the mapping correctly
*/
export const BeneficialOwnerOtherKeys: string[] = [
  "id",
  "ch_reference",
  "name",
  "principal_address",
  "is_service_address_same_as_principal_address",
  "service_address",
  "legal_form",
  "law_governed",
  "public_register_name",
  "registration_number",
  "is_on_register_in_country_formed_in",
  "start_date",
  "ceased_date",
  "beneficial_owner_nature_of_control_types",
  "trustees_nature_of_control_types",
  "trust_control_nature_of_control_types",
  "non_legal_firm_members_nature_of_control_types",
  "owner_of_land_person_nature_of_control_jurisdictions",
  "owner_of_land_other_entity_nature_of_control_jurisdictions",
  "is_on_sanctions_list",
  "trust_ids",
  "relevant_period"
];

export interface BeneficialOwnerOther {
  id: string;
  ch_reference?: string;
  name?: string;
  principal_address?: Address;
  is_service_address_same_as_principal_address?: yesNoResponse;
  service_address?: Address;
  legal_form?: string;
  law_governed?: string;
  public_register_name?: string;
  registration_number?: string;
  is_on_register_in_country_formed_in?: yesNoResponse;
  start_date?: InputDate;
  ceased_date?: InputDate;
  beneficial_owner_nature_of_control_types?: NatureOfControlType[];
  trustees_nature_of_control_types?: NatureOfControlType[];
  trust_control_nature_of_control_types?: NatureOfControlType[];
  non_legal_firm_members_nature_of_control_types?: NatureOfControlType[];
  owner_of_land_person_nature_of_control_jurisdictions?: NatureOfControlJurisdiction[];
  owner_of_land_other_entity_nature_of_control_jurisdictions?: NatureOfControlJurisdiction[];
  is_on_sanctions_list?: yesNoResponse;
  trust_ids?: string[];
  relevant_period?: boolean;
}
