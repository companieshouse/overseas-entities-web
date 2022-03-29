import { Address, InputDate, natureOfControl, yesNoResponse, statementCondition } from "./data.types.model";

export const PrincipalAddressKey = "principalAddress";
export const PrincipalAddressKeys: string[] = ["principalAddressLine1", "principalAddressLine2", "principalAddressTown", "principalAddressCounty", "principalAddressPostcode"];
export const ServiceAddressKey = "serviceAddress";
export const ServiceAddressKeys: string[] = ["serviceAddressLine1", "serviceAddressLine2", "serviceAddressTown", "serviceAddressCounty", "serviceAddressPostcode"];
export const DateKey: string = "startDate";
export const DateKeys: string[] = ["startDate-day", "startDate-month", "startDate-year"];

export const BeneficialOwnerOtherKey: string = "beneficialOwnerOther";
export const BeneficialOwnerOtherKeys: string[] = ["corporationName", "principalAddress", "isSameAddress", "serviceAddress", "lawGoverned", "startDate", "natureOfControl", "statementCondition", "isSactioned"];

export interface BeneficialOwnerOther {
    corporationName?: string
    principalAddress?: Address
    isSameAddress?: yesNoResponse
    serviceAddress?: Address
    lawGoverned?: string
    startDate?: InputDate
    natureOfControl?: natureOfControl
    statementCondition?: statementCondition
    isSactioned?: yesNoResponse
}
