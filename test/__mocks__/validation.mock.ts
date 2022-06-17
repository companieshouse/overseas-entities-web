import { ADDRESS, MO_IND_ID, PRINCIPAL_ADDRESS_MOCK, SERVICE_ADDRESS_MOCK } from "./session.mock";

const NAME_SPECIAL_CHARS = "Kurt Gödel";

const FIRST_NAME_INVALID_CHARS = "Влади́мир";
const NAME_INVALID_CHARS = "Дракон";
const NATIONALITY_INVALID_CHARS = "ру́сская";
const INVALID_CHARS = "Дракон";

const TEN_CHARACTERS_LENGTH = "LKJHG.asdf";
const FIFTY_CHARACTERS_LENGTH = "ABCDEabcde0123456789QWERTYUIOPqwertyuiopZXCVBzxcvb";
const NO_MAX = "ANY";

const MAX_20 = TEN_CHARACTERS_LENGTH.repeat(2);
const MAX_32 = TEN_CHARACTERS_LENGTH.repeat(3) + ".2";
const MAX_50 = FIFTY_CHARACTERS_LENGTH;
const MAX_100 = FIFTY_CHARACTERS_LENGTH.repeat(2);
const MAX_160 = FIFTY_CHARACTERS_LENGTH.repeat(3) + TEN_CHARACTERS_LENGTH;
const MAX_200 = FIFTY_CHARACTERS_LENGTH.repeat(4);
const MAX_250 = FIFTY_CHARACTERS_LENGTH.repeat(5);
const MAX_260 = FIFTY_CHARACTERS_LENGTH.repeat(5) + TEN_CHARACTERS_LENGTH;
const MAX_4000 = FIFTY_CHARACTERS_LENGTH.repeat(80);

const PRINCIPAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK = {
  principal_address_property_name_number: MAX_200 + "1",
  principal_address_line_1: MAX_50 + "1",
  principal_address_line_2: MAX_50 + "1",
  principal_address_town: MAX_50 + "1",
  principal_address_county: MAX_50 + "1",
  principal_address_country: NO_MAX,
  principal_address_postcode: MAX_20 + "1"
};

const PRINCIPAL_ADDRESS_WITH_INVALID_CHARACTERS_FIELDS_MOCK = {
  principal_address_property_name_number: "١",
  principal_address_line_1: "Красная",
  principal_address_line_2: "площадь",
  principal_address_town: "Москва",
  principal_address_county: "Москва",
  principal_address_country: NO_MAX,
  principal_address_postcode: "١١١١١١١"
};

const RESIDENTIAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK = {
  usual_residential_address_property_name_number: MAX_200 + "1",
  usual_residential_address_line_1: MAX_50 + "1",
  usual_residential_address_line_2: MAX_50 + "1",
  usual_residential_address_town: MAX_50 + "1",
  usual_residential_address_county: MAX_50 + "1",
  usual_residential_address_country: NO_MAX,
  usual_residential_address_postcode: MAX_20 + "1"
};

const SERVICE_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK = {
  service_address_property_name_number: MAX_200 + "1",
  service_address_line_1: MAX_50 + "1",
  service_address_line_2: MAX_50 + "1",
  service_address_town: MAX_50 + "1",
  service_address_county: MAX_50 + "1",
  service_address_country: NO_MAX,
  service_address_postcode: MAX_20 + "1"
};

const RESIDENTIAL_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK = {
  usual_residential_address_property_name_number: "١",
  usual_residential_address_line_1: "Красная",
  usual_residential_address_line_2: "площадь",
  usual_residential_address_town: "Москва",
  usual_residential_address_county: "Москва",
  usual_residential_address_country: NO_MAX,
  usual_residential_address_postcode: "١١١١١١١"
};

const SERVICE_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK = {
  service_address_property_name_number: "١",
  service_address_line_1: "Красная",
  service_address_line_2: "площадь",
  service_address_town: "Москва",
  service_address_county: "Москва",
  service_address_country: NO_MAX,
  service_address_postcode: "١١١١١١١"
};

const DATE_OF_BIRTH_MOCK = { 'date_of_birth-day': "1",  "date_of_birth-month": "1", "date_of_birth-year": "2000" };
const START_DATE_MOCK = { 'start_date-day': "1", 'start_date-month': "1", 'start_date-year': "2022" };

export const PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK = {
  full_name: MAX_160 + "1",
  email: MAX_250 + "1"
};

export const PRESENTER_WITH_INVALID_CHARACTERS_FIELDS_MOCK = {
  full_name: NAME_INVALID_CHARS,
  email: "validemailaddress@valid.com"
};

export const PRESENTER_WITH_SPECIAL_CHARACTERS_FIELDS_MOCK = {
  full_name: NAME_SPECIAL_CHARS,
  email: "validemailaddress@valid.com"
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

export const ENTITY_WITH_INVALID_CHARACTERS_FIELDS_MOCK = {
  name: NAME_INVALID_CHARS,
  incorporation_country: NO_MAX,
  is_service_address_same_as_principal_address: 0,
  email: NO_MAX,
  legal_form: "площадь",
  law_governed: "площадь",
  public_register_name: "Москва",
  registration_number: "Москва",
  is_on_register_in_country_formed_in: "1",
  ...PRINCIPAL_ADDRESS_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  ...SERVICE_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK
};

export const BENEFICIAL_OWNER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK = {
  first_name: MAX_50 + "1",
  last_name: MAX_160 + "1",
  nationality: NO_MAX,
  is_on_sanctions_list: "0",
  is_service_address_same_as_usual_residential_address: "1",
  ...RESIDENTIAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
  ...SERVICE_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
  ...DATE_OF_BIRTH_MOCK,
  ...START_DATE_MOCK
};

export const BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK = {
  first_name: FIRST_NAME_INVALID_CHARS,
  last_name: NAME_INVALID_CHARS,
  nationality: NATIONALITY_INVALID_CHARS,
  is_on_sanctions_list: "0",
  is_service_address_same_as_usual_residential_address: "1",
  ...RESIDENTIAL_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK,
  ...SERVICE_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK,
  ...DATE_OF_BIRTH_MOCK,
  ...START_DATE_MOCK
};

export const BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK = {
  first_name: "Joe",
  last_name: "Bloggs",
  nationality: "Utopian",
  is_on_sanctions_list: "0",
  is_service_address_same_as_usual_residential_address: "0",
  ...ADDRESS,
  ...SERVICE_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK,
  ...DATE_OF_BIRTH_MOCK,
  ...START_DATE_MOCK
};

export const BENEFICIAL_OWNER_OTHER_WITH_MAX_LENGTH_FIELDS_MOCK = {
  name: MAX_160 + "1",
  legal_form: MAX_4000 + "1",
  law_governed: MAX_4000 + "1",
  public_register_name: MAX_4000 + "1",
  registration_number: MAX_32 + "1",
  is_on_register_in_country_formed_in: "1",
  is_on_sanctions_list: "0",
  is_service_address_same_as_principal_address: "1",
  ...PRINCIPAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
  ...START_DATE_MOCK
};

export const BENEFICIAL_OWNER_OTHER_WITH_INVALID_CHARS_MOCK = {
  name: NAME_INVALID_CHARS,
  legal_form: INVALID_CHARS,
  law_governed: INVALID_CHARS,
  public_register_name: INVALID_CHARS,
  registration_number: INVALID_CHARS,
  is_on_register_in_country_formed_in: "1",
  is_service_address_same_as_usual_residential_address: "1",
  ...PRINCIPAL_ADDRESS_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  ...ADDRESS
};

export const BENEFICIAL_OWNER_OTHER_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK = {
  name: "Joe Bloggs",
  legal_form: "Dunno",
  law_governed: "Maybe",
  is_on_register_in_country_formed_in: "0",
  is_service_address_same_as_principal_address: "0",
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK
};

export const BENEFICIAL_OWNER_GOV_WITH_MAX_LENGTH_FIELDS_MOCK = {
  name: MAX_160 + "1",
  legal_form: MAX_4000 + "1",
  law_governed: MAX_4000 + "1",
  is_on_sanctions_list: "0",
  is_service_address_same_as_principal_address: "1",
  ...PRINCIPAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
  ...SERVICE_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK,
  ...START_DATE_MOCK
};

export const BENEFICIAL_OWNER_GOV_WITH_INVALID_CHARACTERS_FIELDS_MOCK = {
  name: NAME_INVALID_CHARS,
  legal_form: "площадь",
  law_governed: "площадь",
  is_on_sanctions_list: "0",
  is_service_address_same_as_principal_address: "0",
  ...PRINCIPAL_ADDRESS_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  ...SERVICE_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
  ...START_DATE_MOCK
};

export const MANAGING_OFFICER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK = {
  first_name: MAX_50 + "1",
  last_name: MAX_160 + "1",
  has_former_names: "1",
  former_names: MAX_260 + "1",
  nationality: NO_MAX,
  occupation: MAX_100 + "1",
  role_and_responsibilities: MAX_4000 + "1",
  is_service_address_same_as_usual_residential_address: "0",
  ...DATE_OF_BIRTH_MOCK,
  ...RESIDENTIAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
  ...SERVICE_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK
};

export const MANAGING_OFFICER_CORPORATE_WITH_MAX_LENGTH_FIELDS_MOCK = {
  name: MAX_160 + "1",
  legal_form: MAX_4000 + "1",
  law_governed: MAX_4000 + "1",
  is_on_register_in_country_formed_in: "1",
  public_register_name: MAX_4000 + "1",
  registration_number: MAX_32 + "1",
  is_service_address_same_as_principal_address: "0",
  contact_full_name: MAX_160 + "1",
  contact_email: MAX_250 + "1",
  ...PRINCIPAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
  ...SERVICE_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
  ...START_DATE_MOCK
};

export const MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK = {
  id: MO_IND_ID,
  first_name: FIRST_NAME_INVALID_CHARS,
  last_name: NAME_INVALID_CHARS,
  has_former_names: "1",
  former_names: "кузнец",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: NATIONALITY_INVALID_CHARS,
  is_service_address_same_as_usual_residential_address: "1",
  occupation: "водопроводчик",
  role_and_responsibilities: "сантехника",
  ...RESIDENTIAL_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK,
  ...ADDRESS
};

export const MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK = {
  id: MO_IND_ID,
  first_name: "Joe",
  last_name: "Bloggs",
  has_former_names: "1",
  former_names: "Some name",
  date_of_birth: { day: "21", month: "3", year: "1947" },
  nationality: "Utopian",
  is_service_address_same_as_usual_residential_address: "0",
  occupation: "Some Occupation",
  role_and_responsibilities: "Some role and responsibilities",
  ...ADDRESS,
  ...SERVICE_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK
};

export const MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_MOCK = {
  id: MO_IND_ID,
  name: NAME_INVALID_CHARS,
  is_service_address_same_as_principal_address: "1",
  legal_form: INVALID_CHARS,
  law_governed: INVALID_CHARS,
  is_on_register_in_country_formed_in: "1",
  public_register_name: INVALID_CHARS,
  registration_number: INVALID_CHARS,
  contact_full_name: INVALID_CHARS,
  contact_email: INVALID_CHARS,
  ...PRINCIPAL_ADDRESS_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  ...SERVICE_ADDRESS_MOCK
};

export const MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK = {
  id: MO_IND_ID,
  name: "Bloggs Inc",
  is_service_address_same_as_principal_address: "0",
  legal_form: "legal form",
  law_governed: "law gov",
  is_on_register_in_country_formed_in: "1",
  public_register_name: "reg name",
  registration_number: "abc123",
  ...PRINCIPAL_ADDRESS_MOCK,
  ...SERVICE_ADDRESS_WITH_INVALID_CHAR_FIELDS_MOCK
};
