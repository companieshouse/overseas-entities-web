import { Address, InputDate, yesNoResponse } from "./data.types.model";

export const UsualResidentialAddressKey = "usualResidentialAddress";
export const UsualResidentialAddressKeys: string[] = ["usualResidentialAddressPropertyNameNumber", "usualResidentialAddressLine1", "usualResidentialAddressLine2", "usualResidentialAddressTown", "usualResidentialAddressState", "usualResidentialAddressCountry", "usualResidentialAddressPostcode"];
export const ServiceAddressKey = "serviceAddress";
export const ServiceAddressKeys: string[] = ["serviceAddressPropertyNameNumber", "serviceAddressLine1", "serviceAddressLine2", "serviceAddressTown", "serviceAddressState", "serviceAddressCountry", "serviceAddressPostcode"];
export const DateKey: string = "startDate";
export const DateKeys: string[] = ["startDate-day", "startDate-month", "startDate-year"];
export const ManagingOfficerCorporateKey: string = "managingOfficerCorporate";
export const ManagingOfficerCorporateKeys: string[] = ["officerName", "usualResidentialAddress", "serviceAddress", "isSameAddress",
  "whereOfficerRegistered", "legalForm", "legalAuthority", "registrationNumber", "startDate"];

export interface ManagingOfficerCorporate {
    officerName?: string,
    usualResidentialAddress?: Address,
    serviceAddress?: Address,
    isSameAddress?: yesNoResponse,
    whereOfficerRegistered?: string,
    legalForm?: string,
    legalAuthority?: string,
    registrationNumber?: string,
    startDate?: InputDate
}
