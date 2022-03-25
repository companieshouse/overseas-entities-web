import { Address, yesNoResponse } from "./data.types.model";

/*
  The Entity fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const EntityKey = "entity";
export const EntityKeys: string[] = [
  "overseasEntityName", "incorporationCountry", "principalAddress", "isAddressSameAsPrincipalAddress",
  "serviceAddress", "email", "legalForm", "governedLaw", "publicRegister", "registrationNumber" ];
/*
  The Entity sub-fields for Address Object
*/
export const PrincipalAddressKey = "principalAddress";
export const PrincipalAddressKeys: string[] = ["principalAddressLine1", "principalAddressLine2", "principalAddressTown", "principalAddressCounty", "principalAddressPostcode"];
export const ServiceAddressKey = "serviceAddress";
export const ServiceAddressKeys: string[] = ["serviceAddressLine1", "serviceAddressLine2", "serviceAddressTown", "serviceAddressCounty", "serviceAddressPostcode"];

export interface Entity {
    overseasEntityName?: string
    incorporationCountry?: string
    principalAddress?: Address
    isAddressSameAsPrincipalAddress?: yesNoResponse
    serviceAddress?: Address
    email?: string
    legalForm?: string
    governedLaw?: string
    publicRegister?: string
    registrationNumber?: number
}
