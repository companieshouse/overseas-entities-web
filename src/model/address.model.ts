/*
  [UsualResidential, Principal, Service, Identity]AddressKey should match the address name field
  in every data model where address object has been used
*/

export const UsualResidentialAddressKey = "usual_residential_address";
export const PrincipalAddressKey = "principal_address";
export const ServiceAddressKey = "service_address";
export const IdentityAddressKey = "identity_address";

/*
  The sub-fields for Address Objects used in the templates
*/

export const UsualResidentialAddressKeys: string[] = [
  "usual_residential_address_property_name_number",
  "usual_residential_address_line_1",
  "usual_residential_address_line_2",
  "usual_residential_address_town",
  "usual_residential_address_county",
  "usual_residential_address_country",
  "usual_residential_address_postcode"
];

export const PrincipalAddressKeys: string[] = [
  "principal_address_property_name_number",
  "principal_address_line_1",
  "principal_address_line_2",
  "principal_address_town",
  "principal_address_county",
  "principal_address_country",
  "principal_address_postcode"
];

export const ServiceAddressKeys: string[] = [
  "service_address_property_name_number",
  "service_address_line_1",
  "service_address_line_2",
  "service_address_town",
  "service_address_county",
  "service_address_country",
  "service_address_postcode"
];

export const IdentityAddressKeys: string[] = [
  "identity_address_property_name_number",
  "identity_address_line_1",
  "identity_address_line_2",
  "identity_address_town",
  "identity_address_county",
  "identity_address_country",
  "identity_address_postcode"
];

