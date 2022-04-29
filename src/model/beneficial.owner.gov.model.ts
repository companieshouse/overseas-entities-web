import { Address, InputDate, NatureOfControlType, yesNoResponse } from "./data.types.model";

/*
  The sub-fields for Date Objects
*/
export const StartDateKey: string = "start_date";
export const StartDateKeys: string[] = ["start_date-day", "start_date-month", "start_date-year"];

/*
  The sub-fields for Address Objects
*/
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

export const BeneficialOwnerGovKey = "beneficial_owners_government_or_public_authority";
/*
  The Beneficial Owner Gov fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const BeneficialOwnerGovKeys: string[] = [
  "name",
  "principal_address",
  "is_service_address_same_as_principal_address",
  "service_address",
  "legal_form",
  "law_governed",
  "start_date",
  "beneficial_owner_nature_of_control_types",
  "trustees_nature_of_control_types",
  "non_legal_firm_members_nature_of_control_types" ];


export interface BeneficialOwnerGov {
  name?: string
  principal_address?: Address
  is_service_address_same_as_principal_address?: yesNoResponse
  service_address?: Address
  legal_form?: string
  law_governed?: string
  start_date?: InputDate
  beneficial_owner_nature_of_control_types?: NatureOfControlType[];
  non_legal_firm_members_nature_of_control_types?: NatureOfControlType[];
}
