import { Address, yesNoResponse } from "./data.types.model";


export const EntityKey = "entity";

/*
  The Entity fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const EntityKeys: string[] = [
  "name",
  "incorporation_country",
  "principal_address",
  "is_service_address_same_as_principal_address",
  "service_address",
  "email",
  "legal_form",
  "law_governed",
  "public_register_name",
  "public_register_jurisdiction",
  "registration_number",
  "is_on_register_in_country_formed_in"
];

export interface Entity {
    name?: string;
    incorporation_country?: string;
    principal_address?: Address;
    is_service_address_same_as_principal_address?: yesNoResponse;
    service_address?: Address;
    email?: string;
    legal_form?: string;
    law_governed?: string;
    public_register_name?: string;
    public_register_jurisdiction?: string;
    registration_number?: string;
    is_on_register_in_country_formed_in?: yesNoResponse;
}
