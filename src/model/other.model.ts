import { Address, natureOfControl, yesNoResponse } from "./data.types.model";

enum statementCondition {
    statement1,
    statement2
}

export const DateKey: string = "startDate";
export const DateKeys: string[] = ["startDate-day", "startDate-month", "startDate-year"];

export const OtherBeneficialOwnerKey: string = "otherBeneficialOwner";
export const OtherBeneficialOwnerKeys: string[] = ["corporationName", "principalAddress", "isSameAddress", "serviceAddress", "lawGoverned", "startDate", "natureOfControl", "statementCondition", "isSactioned"];
export interface OtherBeneficialOwner {
    corporationName: string
    principalAddress: Address
    isSameAddress: yesNoResponse
    serviceAddress?: Address
    lawGoverned: string
    startDate: Date
    natureOfControl: natureOfControl
    statementCondition: statementCondition
    isSactioned: yesNoResponse
}
