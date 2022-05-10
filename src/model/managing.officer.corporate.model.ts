import { Address, InputDate, yesNoResponse } from "./data.types.model";

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

export const StartDateKey: string = "start_date";
export const StartDateKeys: string[] = ["start_date-day", "start_date-month", "start_date-year"];

export const ManagingOfficerCorporateKey: string = "managingOfficerCorporate";
export const ManagingOfficerCorporateKeys: string[] = [
  "name",
  "principal_address",
  "service_address",
  "is_service_address_same_as_principal_address",
  "legal_form",
  "law_governed",
  "is_on_register_in_country_formed_in",
  "register_name",
  "registration_number",
  "start_date"
];

export interface ManagingOfficerCorporate {
  name?: string;
  principal_address?: Address;
  is_service_address_same_as_principal_address?: yesNoResponse;
  service_address?: Address;
  legal_form?: string;
  law_governed?: string;
  is_on_register_in_country_formed_in?: yesNoResponse;
  register_name?: string;
  registration_number?: string;
  start_date?: InputDate;
}
