import { Address, InputDate, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const StartDateKey: string = "start_date";
export const StartDateKeys: string[] = ["start_date-day", "start_date-month", "start_date-year"];

export const BeneficialOwnerOtherKey: string = "beneficial_owners_corporate";
export const BeneficialOwnerOtherKeys: string[] = [
  "name",
  "principal_address",
  "is_service_address_same_as_principal_address",
  "service_address",
  "legal_form",
  "law_governed",
  "register_name",
  "registration_number",
  "is_on_register_in_country_formed_in",
  "start_date",
  "beneficial_owner_nature_of_control_types",
  "trustees_nature_of_control_types",
  "non_legal_firm_members_nature_of_control_types",
  "is_on_sanctions_list"
];

export interface BeneficialOwnerOther {
  name?: string;
  principal_address?: Address;
  is_service_address_same_as_principal_address?: yesNoResponse;
  service_address?: Address;
  legal_form?: string;
  law_governed?: string;
  register_name?: string;
  registration_number?: string;
  is_on_register_in_country_formed_in?: yesNoResponse;
  start_date?: InputDate;
  beneficial_owner_nature_of_control_types?: NatureOfControlType[];
  trustees_nature_of_control_types?: NatureOfControlType[];
  non_legal_firm_members_nature_of_control_types?: NatureOfControlType[];
  is_on_sanctions_list?: yesNoResponse;
}
