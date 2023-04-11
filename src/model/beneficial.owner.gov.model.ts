import { Address, InputDate, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const BeneficialOwnerGovKey = "beneficial_owners_government_or_public_authority";

/*
  The Beneficial Owner Gov fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const BeneficialOwnerGovKeys: string[] = [
  "id",
  "name",
  "principal_address",
  "is_service_address_same_as_principal_address",
  "service_address",
  "legal_form",
  "law_governed",
  "start_date",
  "ceased_date",
  "beneficial_owner_nature_of_control_types",
  "non_legal_firm_members_nature_of_control_types",
  "is_on_sanctions_list"
];

export interface BeneficialOwnerGov {
  id: string;
  name?: string;
  principal_address?: Address;
  is_service_address_same_as_principal_address?: yesNoResponse;
  service_address?: Address;
  legal_form?: string;
  law_governed?: string;
  start_date?: InputDate;
  ceased_date?: InputDate;
  beneficial_owner_nature_of_control_types?: NatureOfControlType[];
  non_legal_firm_members_nature_of_control_types?: NatureOfControlType[];
  is_on_sanctions_list?: yesNoResponse;
}
