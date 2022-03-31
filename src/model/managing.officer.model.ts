import { Address, InputDate, yesNoResponse } from "./data.types.model";

/*
  The Officer fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const ManagingOfficerKey = "managingOfficer";
export const ManagingOfficerKeys: string[] = [
  "fullName", "hasAFormerName", "formerName", "dateOfBirth", "nationality", "incorporationCountry", "residentialAddress", "businessOccupation", "roleAndResponsibilities" ];

/*
  The Entity sub-fields for Date Objects
*/
export const DateOfBirthKey: string = "dateOfBirth";
export const DateOfBirthKeys: string[] = ["dateOfBirth-day", "dateOfBirth-month", "dateOfBirth-year"];

/*
  The Officer sub-fields for Address Object
*/
export const UsualResidentialAddressKey = "usualResidentialAddress";
export const UsualResidentialAddressKeys: string[] = [
  "usualResidentialAddressLine1", "usualResidentialAddressLine2", "usualResidentialAddressTown", "usualResidentialAddressCounty", "usualResidentialAddressPostcode"];

export interface ManagingOfficer {
  fullName?: string
  hasAFormerName?: yesNoResponse
  formerName?: string
  dateOfBirth?: InputDate
  nationality?: string
  usualResidentialAddress?: Address
  businessOccupation?: string
  roleAndResponsibilities?: string
}
