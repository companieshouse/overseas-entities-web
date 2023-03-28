import { Address, InputDate, yesNoResponse } from "./data.types.model";

export const ManagingOfficerKey = "managing_officers_individual";

/*
  The Officer fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const ManagingOfficerKeys: string[] = [
  "id",
  "first_name",
  "last_name",
  "has_former_names",
  "former_names",
  "date_of_birth",
  "nationality",
  "second_nationality",
  "usual_residential_address",
  "service_address",
  "is_service_address_same_as_usual_residential_address",
  "occupation",
  "role_and_responsibilities"
];

export interface ManagingOfficerIndividual {
  id: string;
  ch_reference?: string;
  first_name?: string;
  last_name?: string;
  has_former_names?: yesNoResponse;
  former_names?: string;
  date_of_birth?: InputDate;
  nationality?: string;
  second_nationality?: string;
  usual_residential_address?: Address;
  service_address?: Address;
  is_service_address_same_as_usual_residential_address?: yesNoResponse;
  occupation?: string;
  role_and_responsibilities?: string;
  resigned_on?: InputDate;
}

export const FormerNamesKey = "former_names";
