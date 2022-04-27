import { Address, InputDate, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const PrincipalAddressKey = "principal_address";
export const PrincipalAddressKeys: string[] = [
  "principal_address_property_name_number",
  "principal_address_line1",
  "principal_address_line2",
  "principal_address_town",
  "principal_address_county",
  "principal_address_country",
  "principal_address_postcode"
];

export const CorrespondenceAddressKey = "service_address";
export const CorrespondenceAddressKeys: string[] = [
  "service_address_property_name_number",
  "service_address_line1",
  "service_address_line2",
  "service_address_town",
  "service_address_county",
  "service_address_country",
  "service_address_postcode"
];

export const DateKey: string = "start_date";
export const DateKeys: string[] = ["start_date_day", "start_date_month", "start_date_year"];

export const BeneficialOwnerOtherKey: string = "beneficial_owners_other";
export const BeneficialOwnerOtherKeys: string[] = [
  "corporation_name",
  "principal_address",
  "is_same_address",
  "service_address",
  "legal_form",
  "law_governed",
  "register_name",
  "register_number",
  "public_register",
  "start_date",
  "beneficial_owner_nature_of_control_types",
  "trustees_nature_of_control_types",
  "non_legal_firm_members_nature_of_control_types",
  "is_sanctioned"
];

export interface BeneficialOwnerOther {
  corporation_name?: string;
  principal_address?: Address;
  is_same_address?: yesNoResponse;
  service_address?: Address;
  legal_form?: string;
  law_governed?: string;
  register_name?: string;
  register_number?: string;
  public_register?: yesNoResponse;
  start_date?: InputDate;
  beneficial_owner_nature_of_control_types?: NatureOfControlType[];
  trustees_nature_of_control_types?: NatureOfControlType[];
  non_legal_firm_members_nature_of_control_types?: NatureOfControlType[];
  is_sanctioned?: yesNoResponse;
}
