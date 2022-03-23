import { Address, natureOfControl, userResponse } from "model/data-types.model";

enum conditionStatement {
    statement1,
    statement2
  }

export interface OtherBeneficialOwner {
    name: string
    officeAddress: Address
    isServiceAddressSameToOfficeAddress: userResponse
    serviceAddress?: Address
    governedLaw: string
    startDate: Date
    natureOfControl: natureOfControl
    conditionStatement: conditionStatement // ????????
    isSactioned: userResponse
}
