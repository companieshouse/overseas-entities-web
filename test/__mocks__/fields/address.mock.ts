import { MAX_15, MAX_50, NO_MAX } from "../max.length.mock";

export const ADDRESS = {
  property_name_number: "1",
  line_1: "addressLine1",
  line_2: "addressLine2",
  town: "town",
  county: "county",
  country: "country",
  postcode: "BY 2"
};

export const PRINCIPAL_ADDRESS = {
  principal_address_property_name_number: "1",
  principal_address_line_1: "addressLine1",
  principal_address_line_2: "addressLine2",
  principal_address_town: "town",
  principal_address_county: "county",
  principal_address_country: "country",
  principal_address_postcode: "BY 2",
};

export const IDENTITY_ADDRESS_REQ_BODY_MOCK = {
  identity_address_property_name_number: "1",
  identity_address_line_1: "addressLine1",
  identity_address_line_2: "addressLine2",
  identity_address_town: "town",
  identity_address_county: "county",
  identity_address_country: "country",
  identity_address_postcode: "BY 2"
};

export const IDENTITY_ADDRESS_REQ_BODY_EMPTY_MOCK = {
  identity_address_property_name_number: "",
  identity_address_line_1: "",
  identity_address_line_2: "",
  identity_address_town: "",
  identity_address_county: "",
  identity_address_country: "",
  identity_address_postcode: ""
};

export const IDENTITY_ADDRESS_REQ_BODY_MAX_LENGTH_MOCK = {
  identity_address_property_name_number: MAX_50 + "1",
  identity_address_line_1: MAX_50 + "1",
  identity_address_line_2: MAX_50 + "1",
  identity_address_town: MAX_50 + "1",
  identity_address_county: MAX_50 + "1",
  identity_address_country: NO_MAX,
  identity_address_postcode: MAX_15 + "1"
};
