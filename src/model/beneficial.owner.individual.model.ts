import { Address, InputDate, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const BeneficialOwnerIndividualKey = "beneficial_owners_individual";
/*
  The Beneficial Owner Individual fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const BeneficialOwnerIndividualKeys: string[] = [
  "first_name",
  "last_name",
  "date_of_birth",
  "nationality",
  "usual_residential_address",
  "is_service_address_same_as_usual_residential_address",
  "service_address",
  "start_date",
  "beneficial_owner_nature_of_control_types",
  "trustees_nature_of_control_types",
  "non_legal_firm_members_nature_of_control_types",
  "is_on_sanctions_list",
];

/*
  The sub-fields for Date Objects
*/
export const DateOfBirthKey: string = "date_of_birth";
export const DateOfBirthKeys: string[] = ["date_of_birth-day", "date_of_birth-month", "date_of_birth-year"];

export const StartDateKey: string = "start_date";
export const StartDateKeys: string[] = ["start_date-day", "start_date-month", "start_date-year"];

/*
  The sub-fields for Address Objects
*/
export const UsualResidentialAddressKey = "usual_residential_address";
export const UsualResidentialAddressKeys: string[] = [
  "usualResidentialAddressPropertyNameNumber",
  "usualResidentialAddressLine1",
  "usualResidentialAddressLine2",
  "usualResidentialAddressTown",
  "usualResidentialAddressCounty",
  "usualResidentialAddressCountry",
  "usualResidentialAddressPostcode"
];

export const ServiceAddressKey = "service_address";
export const ServiceAddressKeys: string[] = [
  "serviceAddressPropertyNameNumber",
  "serviceAddressLine1",
  "serviceAddressLine2",
  "serviceAddressTown",
  "serviceAddressCounty",
  "serviceAddressCountry",
  "serviceAddressPostcode"
];

export interface BeneficialOwnerIndividual {
  first_name?: string;
  last_name?: string;
  date_of_birth?: InputDate;
  nationality?: string;
  usual_residential_address?: Address;
  is_service_address_same_as_usual_residential_address?: yesNoResponse;
  service_address?: Address;
  start_date?: InputDate;
  beneficial_owner_nature_of_control_types?: NatureOfControlType[];
  trustees_nature_of_control_types?: NatureOfControlType[];
  non_legal_firm_members_nature_of_control_types?: NatureOfControlType[];
  is_on_sanctions_list?: yesNoResponse;
}

// Boolean fields need to parsed from string to number
export const HasSameAddressKey = "is_service_address_same_as_usual_residential_address";
export const IsOnSanctionsListKey = "is_on_sanctions_list";
