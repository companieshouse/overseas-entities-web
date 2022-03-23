import { Address, userResponse } from "./data-types.model";

export interface Entity {
    overseasEntityName: string
    incorporationCountry: string
    principalAddress: Address
    isAddressSameToPrincipalAddress: userResponse
    serviceAddress?: Address
    email: string
    legalForm: string
    governedLaw: string
    publicRegister: string
    registrationNumber: number
}
