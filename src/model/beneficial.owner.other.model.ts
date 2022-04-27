import { Address, InputDate, NatureOfControlType, yesNoResponse } from "./data.types.model";

export const PrincipalAddressKey = "principalAddress";
export const PrincipalAddressKeys: string[] = ["principalAddressPropertyNameNumber", "principalAddressLine1", "principalAddressLine2", "principalAddressTown", "principalAddressCounty", "principalAddressCountry", "principalAddressPostcode"];
export const ServiceAddressKey = "serviceAddress";
export const ServiceAddressKeys: string[] = ["serviceAddressPropertyNameNumber", "serviceAddressLine1", "serviceAddressLine2", "serviceAddressTown", "serviceAddressCounty", "serviceAddressCountry", "serviceAddressPostcode"];
export const DateKey: string = "startDate";
export const DateKeys: string[] = ["startDate-day", "startDate-month", "startDate-year"];

export const BeneficialOwnerOtherKey: string = "beneficialOwnerOther";
export const BeneficialOwnerOtherKeys: string[] = ["corporationName", "principalAddress", "isSameAddress", "serviceAddress", "legalForm", "lawGoverned", "registerName", "registerNumber", "publicRegister", "startDate", "natureOfControlIndividual",  "natureOfControlTrust", "natureOfControlFirm", "isSanctioned"];

export interface BeneficialOwnerOther {
    corporationName?: string;
    principalAddress?: Address;
    isSameAddress?: yesNoResponse;
    serviceAddress?: Address;
    legalForm?: string;
    lawGoverned?: string;
    registerName?: string;
    registerNumber?: string;
    publicRegister?: yesNoResponse;
    startDate?: InputDate;
    natureOfControlIndividual?: [NatureOfControlType];
    natureOfControlTrust?: [NatureOfControlType];
    natureOfControlFirm?: [NatureOfControlType];
    isSanctioned?: yesNoResponse;
}
