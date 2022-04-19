import { Address, InputDate, natureOfControl, yesNoResponse, statementCondition } from "./data.types.model";

export const PrincipalAddressKey = "principalAddress";
export const PrincipalAddressKeys: string[] = ["principalAddressPropertyNameNumber", "principalAddressLine1", "principalAddressLine2", "principalAddressTown", "principalAddressCounty", "principalAddressCountry", "principalAddressPostcode"];
export const ServiceAddressKey = "serviceAddress";
export const ServiceAddressKeys: string[] = ["serviceAddressPropertyNameNumber", "serviceAddressLine1", "serviceAddressLine2", "serviceAddressTown", "serviceAddressCounty", "serviceAddressCountry", "serviceAddressPostcode"];
export const DateKey: string = "startDate";
export const DateKeys: string[] = ["startDate-day", "startDate-month", "startDate-year"];

export const BeneficialOwnerOtherKey: string = "beneficialOwnerOther";
export const BeneficialOwnerOtherKeys: string[] = ["corporationName", "principalAddress", "isSameAddress", "serviceAddress", "lawGoverned", "startDate", "natureOfControl", "statementCondition", "isSanctioned"];

export interface BeneficialOwnerOther {
    corporationName?: string
    principalAddress?: Address
    isSameAddress?: yesNoResponse
    serviceAddress?: Address
    lawGoverned?: string
    startDate?: InputDate
    natureOfControl?: natureOfControl
    statementCondition?: statementCondition
    isSanctioned?: yesNoResponse
}
