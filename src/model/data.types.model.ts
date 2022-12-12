export interface Address {
  property_name_number?: string;
  line_1?: string;
  line_2?: string;
  town?: string;
  county?: string;
  country?: string;
  postcode?: string;
}

export enum yesNoResponse {
  No = 0,
  Yes = 1
}
export interface InputDate {
  day: string;
  month: string;
  year: string;
}

export enum NatureOfControlType {
  OVER_25_PERCENT_OF_SHARES = "OVER_25_PERCENT_OF_SHARES",
  OVER_25_PERCENT_OF_VOTING_RIGHTS = "OVER_25_PERCENT_OF_VOTING_RIGHTS",
  APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS = "APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS",
  SIGNIFICANT_INFLUENCE_OR_CONTROL = "SIGNIFICANT_INFLUENCE_OR_CONTROL"
}

/*
  Address and InputDate key fields - Position is important for the mapping of sub-fields Address Objects!
*/
export const AddressKeys: string[] = [
  "property_name_number",
  "line_1",
  "line_2",
  "town",
  "county",
  "country",
  "postcode"
];

export const InputDateKeys: string[] = [
  "day",
  "month",
  "year"
];

export const LANDING_PAGE_QUERY_PARAM = "start";

// BOs and MOs ID field name
export const ID = "id";

// Boolean fields need to be parsed from string to number
export const HasSameResidentialAddressKey = "is_service_address_same_as_usual_residential_address";
export const HasSamePrincipalAddressKey = "is_service_address_same_as_principal_address";
export const IsOnSanctionsListKey = "is_on_sanctions_list";
export const IsOnRegisterInCountryFormedInKey = "is_on_register_in_country_formed_in";
export const HasFormerNames = "has_former_names";

// Array NOC fields
export const BeneficialOwnerNoc = "beneficial_owner_nature_of_control_types";
export const TrusteesNoc = "trustees_nature_of_control_types";
export const NonLegalFirmNoc = "non_legal_firm_members_nature_of_control_types";

// Payment, OE and Transaction keys
export const PaymentKey = "payment";
export const OverseasEntityKey = "overseas_entity_id";
export const Transactionkey = "transaction_id";

// Is secure and Has sold land Keys
export const HasSoldLandKey = "has_sold_land";
export const IsSecureRegisterKey = "is_secure_register";

// Register keys
export const PublicRegisterNameKey = "public_register_name";
export const PublicRegisterJurisdictionKey = "public_register_jurisdiction";
export const RegistrationNumberKey = "registration_number";

// Update Journey
export const OeNumberKey = "oe_number";
