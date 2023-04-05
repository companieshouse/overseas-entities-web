import { Address, InputDate, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const BeneficialOwnerIndividualKey = "beneficial_owners_individual";

/*
  The Beneficial Owner Individual fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const BeneficialOwnerIndividualKeys: string[] = [
  "id",
  "first_name",
  "last_name",
  "date_of_birth",
  "nationality",
  "second_nationality",
  "usual_residential_address",
  "is_service_address_same_as_usual_residential_address",
  "service_address",
  "start_date",
  "ceased_date",
  "beneficial_owner_nature_of_control_types",
  "trustees_nature_of_control_types",
  "non_legal_firm_members_nature_of_control_types",
  "is_on_sanctions_list",
  "trust_ids"
];

export interface BeneficialOwnerIndividual {
  id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: InputDate;
  nationality?: string;
  second_nationality?: string;
  usual_residential_address?: Address;
  is_service_address_same_as_usual_residential_address?: yesNoResponse;
  service_address?: Address;
  start_date?: InputDate;
  ceased_date?: InputDate;
  beneficial_owner_nature_of_control_types?: NatureOfControlType[];
  trustees_nature_of_control_types?: NatureOfControlType[];
  non_legal_firm_members_nature_of_control_types?: NatureOfControlType[];
  is_on_sanctions_list?: yesNoResponse;
  trust_ids?: string[];
}
