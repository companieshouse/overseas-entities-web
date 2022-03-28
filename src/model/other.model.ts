import { Address, InputDate, natureOfControl, yesNoResponse } from "./data.types.model";

export enum statementCondition {
    statement1,
    statement2
}

export const DateKey: string = "startDate";
export const DateKeys: string[] = ["startDate-day", "startDate-month", "startDate-year"];

export const BeneficialOwnerOtherKey: string = "beneficialOwnerOther";
export const BeneficialOwnerOtherKeys: string[] = ["corporationName", "principalAddress", "isSameAddress", "serviceAddress", "lawGoverned", "startDate", "natureOfControl", "statementCondition", "isSactioned"];
export interface BeneficialOwnerOther {
    corporationName: string
    principalAddress: Address
    isSameAddress: yesNoResponse
    serviceAddress?: Address
    lawGoverned: string
    startDate: InputDate
    natureOfControl: natureOfControl
    statementCondition: statementCondition
    isSactioned: yesNoResponse
}
