import { Address, InputDate, NatureOfControlJurisdiction, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const BeneficialOwnerIndividualKey = "beneficial_owners_individual";

/*
  The Beneficial Owner Individual fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const BeneficialOwnerIndividualKeys: string[] = [
  "id",
  "ch_reference",
  "first_name",
  "last_name",
  "date_of_birth",
  "have_day_of_birth",
  "nationality",
  "second_nationality",
  "usual_residential_address",
  "is_service_address_same_as_usual_residential_address",
  "service_address",
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
  "relevant_period",
];

export interface BeneficialOwnerIndividual {
  id: string;
  ch_reference?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: InputDate;
  have_day_of_birth?: boolean;
  nationality?: string;
  second_nationality?: string;
  usual_residential_address?: Address;
  is_service_address_same_as_usual_residential_address?: yesNoResponse;
  service_address?: Address;
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
