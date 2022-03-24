import { Address, userResponse } from "./data.types.model";

export const EntityKey = "entity";
/*
  The Entity fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const EntityKeys: string[] = ["overseasEntityName", "incorporationCountry", "principalAddress", "isAddressSameToPrincipalAddress",
  "serviceAddress", "email", "legalForm", "governedLaw", "publicRegister", "registrationNumber" ];

export interface Entity {
    overseasEntityName?: string
    incorporationCountry?: string
    principalAddress?: Address
    isAddressSameToPrincipalAddress?: userResponse
    serviceAddress?: Address
    email?: string
    legalForm?: string
    governedLaw?: string
    publicRegister?: string
    registrationNumber?: number
}
