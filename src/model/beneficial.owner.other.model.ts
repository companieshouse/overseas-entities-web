import { Address, InputDate, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const PrincipalAddressKey = "principal_address";
export const PrincipalAddressKeys: string[] = [
  "principal_address_property_name_number",
  "principal_address_line_1",
  "principal_address_line_2",
  "principal_address_town",
  "principal_address_county",
  "principal_address_country",
  "principal_address_postcode"
];

export const ServiceAddressKey = "service_address";
export const ServiceAddressKeys: string[] = [
  "service_address_property_name_number",
  "service_address_line_1",
  "service_address_line_2",
  "service_address_town",
  "service_address_county",
  "service_address_country",
  "service_address_postcode"
];

export const DateKey: string = "start_date";
export const DateKeys: string[] = ["start_date_day", "start_date_month", "start_date_year"];

export const BeneficialOwnerOtherKey: string = "beneficial_owners_other";
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
