export enum ErrorMessages {
  ENTITY_NAME = "Enter the name of the overseas entity",
  MANAGING_OFFICER_CORPORATE_NAME = "Enter the corporate managing officer’s name",
  EMAIL = "Enter an email address",
  LEGAL_FORM = "Enter the legal form",
  LAW_GOVERNED = "Enter the governing law",
  FULL_NAME = "Enter a full name",
  FIRST_NAME = "Enter the individual person’s first name",
  LAST_NAME = "Enter the individual person’s last name",
  FORMER_NAME = "Enter the individual person’s former name or names",
  ROLE = "Enter a description of the individual person’s role and responsibilities",
  ROLE_AND_RESPONSIBILITIES_CORPORATE = "Enter a description of the corporate managing officer’s role and responsibilities",
  NATIONALITY = "Enter the individual person’s nationality",
  OCCUPATION = "Enter an occupation",
  DUE_DILIGENCE_NAME = "Enter the name of the agent that carried out identity checks",
  OE_DUE_DILIGENCE_NAME = "Enter the name of the person or company that carried out identity checks",
  AGENT_CODE = "Enter the agent assurance code",
  PARTNER_NAME = "Enter the name of the person with overall responsibility for identity checks",
  SUPERVISORY_NAME = "Enter the name of the supervisory body",
  BENEFICIAL_OWNER_OTHER_NAME="Enter the other legal entity’s name",
  // Public Register
  PUBLIC_REGISTER_NAME = "Enter the name of the register",
  PUBLIC_REGISTER_NUMBER = "Enter the registration number",
  // Address
  PROPERTY_NAME_OR_NUMBER = "Enter a property name or number",
  ADDRESS_LINE1 = "Enter an address",
  CITY_OR_TOWN = "Enter a city or town",
  COUNTY = "Enter a county",
  COUNTRY = "Select a country from the list",
  UK_COUNTRY = "Select a country",
  POSTCODE = "Enter a postcode",
  // Date
  DAY = "Date must include a day ",
  MONTH = "Date must include a month",
  YEAR = "Date must include a year",
  DAY_OF_BIRTH = "Date of birth must include a day",
  MONTH_OF_BIRTH = "Date of birth must include a month",
  YEAR_OF_BIRTH = "Date of birth must include a year",
  ENTER_DATE_OF_BIRTH = "Enter the individual person’s date of birth",
  ENTER_START_DATE = "Enter the date",
  INVALID_START_DATE = "Date entered must be a real date",
  INVALID_DATE_OF_BIRTH = "Date of birth must be a real date",
  MO_START_DATE_NOT_IN_PAST = "The date it became a managing officer must be in the past",
  // No radio selected
  SELECT_IF_ENTITY_HAS_SOLD_LAND = "Select yes if the entity has disposed of UK property or land since 28 February 2022",
  SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME = "Select yes if the individual person has any former names",
  SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN = "Select yes if the overseas entity is already on a public register in the country it was formed in",
  SELECT_IF_MANAGING_OFFICER_REGISTER_IN_COUNTRY_FORMED_IN = "Select yes if the corporate managing officer is already on a public register in the country it was formed",
  SELECT_IF_BENEFICIAL_OWNER_OTHER_REGISTER_IN_COUNTRY_FORMED_IN = "Select yes if the other legal entity is already on a public register in the country it was formed in",
  SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS = "Select yes if the correspondence address the same as the principal or registered office address",
  SELECT_IF_MANAGING_OFFICER_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS = "Select yes if the corporate managing officer’s correspondence address is the same as the principal or registered office address",
  SELECT_IF_BENEFICIAL_OWNER_OTHER_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS = "Select yes if the other legal entity’s correspondence address is the same as its principal or registered office address",
  SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS = "Select yes if the individual person’s correspondence address is the same as their home address",
  SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED = "Select if any beneficial owners have been identified",
  SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD = "Select the type of beneficial owner or managing officer you want to add",
  SELECT_IF_SECURE_REGISTER_FILTER = "Select yes if any of the entity’s beneficial owners have ever applied to protect personal information at Companies House",
  SELECT_WHO_IS_MAKING_FILING = "Select who is completing this registration",
  CHECK_DILIGENCE = "Check and confirm the statement of compliance",
  // MAX Lengths
  MAX_FIRST_NAME_LENGTH = "First name must be 50 characters or less",
  MAX_LAST_NAME_LENGTH = "Last name must be 160 characters or less",
  MAX_FORMER_NAME_LENGTH = "Former names must be 260 characters or less",
  MAX_NAME_LENGTH = "Name must be 160 characters or less",
  MAX_FULL_NAME_LENGTH = "Full name must be 160 characters or less",
  MAX_EMAIL_LENGTH = "Email address must be 250 characters or less",
  MAX_PROPERTY_NAME_OR_NUMBER_LENGTH = "Property name or number must be 200 characters or less",
  MAX_ADDRESS_LINE1_LENGTH = "Address line 1 must be 50 characters or less",
  MAX_ADDRESS_LINE2_LENGTH = "Address line 2 must be 50 characters or less",
  MAX_CITY_OR_TOWN_LENGTH = "City or town must be 50 characters or less",
  MAX_COUNTY_LENGTH = "County, state, province or region must be 50 characters or less",
  MAX_POSTCODE_LENGTH = "Postcode must be 20 characters or less",
  MAX_LEGAL_FORM_LENGTH = "Legal form must be 4000 characters or less",
  MAX_LAW_GOVERNED_LENGTH = "Governing law must be 4000 characters or less",
  MAX_PUBLIC_REGISTER_NAME_LENGTH = "Name of register must be 4000 characters or less",
  MAX_PUBLIC_REGISTER_NUMBER_LENGTH = "Registration number must be 32 characters or less",
  MAX_OCCUPATION_LENGTH = "Occupation must be 100 characters or less",
  MAX_ROLE_LENGTH = "Role and responsibilities must be 256 characters or less",
  // Invalid characters
  FULL_NAME_INVALID_CHARACTERS = "Full name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  FIRST_NAME_INVALID_CHARACTERS = "First name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  LAST_NAME_INVALID_CHARACTERS = "Last name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  NATIONALITY_INVALID_CHARACTERS = "Nationality must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS = "Property name or number must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  ADDRESS_LINE_1_INVALID_CHARACTERS = "Address line 1 must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  ADDRESS_LINE_2_INVALID_CHARACTERS = "Address line 2 must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  CITY_OR_TOWN_INVALID_CHARACTERS = "City or town must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS = "County, state, province or region must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  POSTCODE_ZIPCODE_INVALID_CHARACTERS = "Postcode or ZIP code must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  NAME_INVALID_CHARACTERS = "Name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  PUBLIC_REGISTER_NAME_INVALID_CHARACTERS = "Name of register must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS = "Registration number must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  ENTITY_NAME_INVALID_CHARACTERS = "The name of the overseas entity must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  LEGAL_FORM_INVALID_CHARACTERS = "Legal form must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  LAW_GOVERNED_INVALID_CHARACTERS = "Governing law must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  FORMER_NAMES_INVALID_CHARACTERS = "Former name or names must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  OCCUPATION_INVALID_CHARACTERS = "Occupation must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS = "Role and responsibilities must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  CONTACT_NAME_INVALID_CHARACTERS = "Contact name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  EMAIL_INVALID_FORMAT = "Enter an email address in the correct format, like name@example.com"
}
