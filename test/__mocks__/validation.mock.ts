
const TEN_CHARACTERS_LENGTH = "LKJHG.asdf";
const FIFTY_CHARACTERS_LENGTH = "ABCDEabcde0123456789QWERTYUIOPqwertyuiopZXCVBzxcvb";
const NO_MAX = "ANY";

const MAX_20 = TEN_CHARACTERS_LENGTH.repeat(2);
const MAX_32 = TEN_CHARACTERS_LENGTH.repeat(3) + ".2";
const MAX_50 = FIFTY_CHARACTERS_LENGTH;
const MAX_160 = FIFTY_CHARACTERS_LENGTH.repeat(3) + TEN_CHARACTERS_LENGTH;
const MAX_200 = FIFTY_CHARACTERS_LENGTH.repeat(4);
const MAX_250 = FIFTY_CHARACTERS_LENGTH.repeat(5);
const MAX_4000 = FIFTY_CHARACTERS_LENGTH.repeat(80);

export const PRINCIPAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK = {
  principal_address_property_name_number: MAX_200 + "1",
  principal_address_line_1: MAX_50 + "1",
  principal_address_line_2: MAX_50 + "1",
  principal_address_town: MAX_50 + "1",
  principal_address_county: MAX_50 + "1",
  principal_address_country: NO_MAX,
  principal_address_postcode: MAX_20 + "1",
};

export const PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK = {
  full_name: MAX_160 + "1",
  email: MAX_250 + "1"
};

export const ENTITY_WITH_MAX_LENGTH_FIELDS_MOCK = {
  name: MAX_160 + "1",
  incorporation_country: NO_MAX,
  is_service_address_same_as_principal_address: 1,
  email: MAX_250 + "1",
  legal_form: MAX_4000 + "1",
  law_governed: MAX_4000 + "1",
  public_register_name: MAX_4000 + "1",
  registration_number: MAX_32 + "1",
  is_on_register_in_country_formed_in: "1",
  ...PRINCIPAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK
};
