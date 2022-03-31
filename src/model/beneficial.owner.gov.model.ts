import { Address, corpNatureOfControl, InputDate, yesNoResponse } from "./data.types.model";

export const BeneficialOwnerGovKey = "beneficialOwnerGov";
/*
  The Beneficial Owner Gov fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const BeneficialOwnerGovKeys: string[] = [ "corpName", "isServiceAddressSameAsPrincipalAddress", "corpLawGoverned", "corpStartDate", "corpNatureOfControl", "corpNatureOfControl", "onSanctionsList" ];

/*
  The sub-fields for Date Objects
*/
export const CorpStartDateKey: string = "corpStartDate";
export const CorpStartDateKeys: string[] = ["corpStartDate-day", "corpStartDate-month", "corpStartDate-year"];

/*
  The sub-fields for Address Objects
*/
export const PrincipalAddressKey = "principalAddress";
export const PrincipalAddressKeys: string[] = ["principalAddressPropertyNameNumber", "principalAddressLine1", "principalAddressLine2", "principalAddressCityTown", "principalAddressState", "principalAddressCountry", "principalAddressPostcode"];
export const ServiceAddressKey = "serviceAddress";
export const ServiceAddressKeys: string[] = ["serviceAddressPropertyNameNumber", "serviceAddressLine1", "serviceAddressLine2", "serviceAddressCityTown", "serviceAddressState", "serviceAddressCountry", "serviceAddressPostcode"];

export interface BeneficialOwnerGov {
    corpName?: string
    principalAddress?: Address
    serviceAddress?: Address
    isServiceAddressSameAsPrincipalAddress?: yesNoResponse
    corpLawGoverned?: string
    corpStartDate?: InputDate
    corpNatureOfControl?: corpNatureOfControl
    onSanctionsList?: yesNoResponse
}
