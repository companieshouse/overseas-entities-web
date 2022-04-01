import { Address, corpNatureOfControl, InputDate, yesNoResponse } from "./data.types.model";

export const BeneficialOwnerGovKey = "beneficialOwnerGov";
/*
  The Beneficial Owner Gov fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const BeneficialOwnerGovKeys: string[] = [ "corporationName", "isServiceAddressSameAsPrincipalAddress", "corporationLawGoverned", "corporationStartDate", "corporationNatureOfControl", "isOnSanctionsList" ];

/*
  The sub-fields for Date Objects
*/
export const CorporationStartDateKey: string = "corporationStartDate";
export const CorporationStartDateKeys: string[] = ["corporationStartDate-day", "corporationStartDate-month", "corporationStartDate-year"];

/*
  The sub-fields for Address Objects
*/
export const PrincipalAddressKey = "principalAddress";
export const PrincipalAddressKeys: string[] = ["principalAddressPropertyNameNumber", "principalAddressLine1", "principalAddressLine2", "principalAddressCityTown", "principalAddressState", "principalAddressCountry", "principalAddressPostcode"];
export const ServiceAddressKey = "serviceAddress";
export const ServiceAddressKeys: string[] = ["serviceAddressPropertyNameNumber", "serviceAddressLine1", "serviceAddressLine2", "serviceAddressCityTown", "serviceAddressState", "serviceAddressCountry", "serviceAddressPostcode"];

export interface BeneficialOwnerGov {
    corporationName?: string
    principalAddress?: Address
    serviceAddress?: Address
    isServiceAddressSameAsPrincipalAddress?: yesNoResponse
    corporationLawGoverned?: string
    corporationStartDate?: InputDate
    corporationNatureOfControl?: corpNatureOfControl
    isOnSanctionsList?: yesNoResponse
}
