import { Address, yesNoResponse } from "./data.types.model";

/*
  The Officer fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const OfficerKey = "entity";
export const OfficerKeys: string[] = [
  "officerName", "hasOfficerAFormerName", "officerFormerName", "officerDateOfBirth",
  "officerNationality", "incorporationCountry", "residentialAddress", "officerOccupation", "officerResponsibilities" ];
/*
  The Officer sub-fields for Address Object
*/
export const ResidentialAddressKey = "residentialAddress";
export const ResidentialAddressKeys: string[] = ["residentialAddressLine1", "residentialAddressLine2", "residentialAddressTown", "residentialAddressCounty", "residentialAddressPostcode"];

export interface Officer {
  officerName?: string
  hasOfficerAFormerName?: yesNoResponse
  officerFormerName?: string
  officerDateOfBirth?: string
  officerNationality?: string
  incorporationCountry?: string
  residentialAddress?: Address
  officerOccupation?: string
  officerResponsibilities?: string
}
