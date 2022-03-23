import { Address, userResponse } from "model/data-types.model";

export interface ManagingOfficer {
    fullName: string
    hasNameChanged: userResponse
    formerName?: string
    dateOfBirth: Date
    nationality: string
    residentialAddress: Address
    occupation?: string
    roleRelatedToEntity?: string
}
