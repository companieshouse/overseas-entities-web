import { Address, natureOfControl, userResponse } from "model/data-types.model";

export interface IndividualBeneficialOwner {
    fullName: string
    dateOfBirth: Date
    nationality: string
    residentialAddress: Address
    isServiceAddressSameToResidentialAddress: userResponse
    serviceAddress?: Address
    startDate: Date
    natureOfControl: natureOfControl
    isTrustee: userResponse // ????????
    isInSanctionsList: userResponse
}
