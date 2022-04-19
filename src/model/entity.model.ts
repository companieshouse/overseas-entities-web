import { Address, yesNoResponse } from "./data.types.model";

/*
  The Entity fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const EntityKey = "entity";
export const EntityKeys: string[] = [
  "name", "incorporation_country", "principal_address", "is_service_address_same_as_principal_address",
  "service_address", "email", "legal_form", "law_governed", "public_register_name", "registration_number" ];
/*
  The Entity sub-fields for Address Object - Used to map View and Data
*/
export const PrincipalAddressKey = "principal_address";
export const PrincipalAddressKeys: string[] = ["principalAddressPropertyNameNumber", "principalAddressLine1", "principalAddressLine2", "principalAddressTown", "principalAddressCounty", "principalAddressCountry", "principalAddressPostcode"];
export const ServiceAddressKey = "service_address";
export const ServiceAddressKeys: string[] = ["serviceAddressPropertyNameNumber", "serviceAddressLine1", "serviceAddressLine2", "serviceAddressTown", "serviceAddressCounty", "serviceAddressCountry", "serviceAddressPostcode"];

export const HasSameAddressKey = "is_service_address_same_as_principal_address";

export interface Entity {
    name?: string
    incorporation_country?: string
    principal_address?: Address
    is_service_address_same_as_principal_address?: yesNoResponse
    service_address?: Address
    email?: string
    legal_form?: string
    law_governed?: string
    public_register_name?: string
    registration_number?: string
}
