import { Address, InputDate, yesNoResponse } from "./data.types.model";

export const ManagingOfficerCorporateKey: string = "managing_officers_corporate";
export const ManagingOfficerCorporateKeys: string[] = [
  "name",
  "principal_address",
  "service_address",
  "is_service_address_same_as_principal_address",
  "legal_form",
  "law_governed",
  "is_on_register_in_country_formed_in",
  "public_register_name",
  "registration_number",
  "start_date",
  "contact-full-name",
  "contact-email"
];

export interface ManagingOfficerCorporate {
  name?: string;
  principal_address?: Address;
  is_service_address_same_as_principal_address?: yesNoResponse;
  service_address?: Address;
  legal_form?: string;
  law_governed?: string;
  is_on_register_in_country_formed_in?: yesNoResponse;
  public_register_name?: string;
  registration_number?: string;
  start_date?: InputDate;
  contact_full_name: string;
  contact_email: string;
}
