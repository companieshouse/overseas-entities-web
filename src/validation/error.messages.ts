export enum ErrorMessages {
  ENTITY_NAME = "Enter the name of the overseas entity",
  MANAGING_OFFICER_CORPORATE_NAME = "Enter the corporate managing officer’s name",
  EMAIL = "Enter an email address",
  LEGAL_FORM = "Enter the legal form",
  LEGAL_FORM_LEGAL_ENTITY_BO = "Enter its legal form",
  LAW_GOVERNED = "Enter the governing law",
  FULL_NAME = "Enter a full name",
  FIRST_NAME = "Enter the individual person’s first name",
  FIRST_NAME_INDIVIDUAL_BO = "Enter their first name",
  LAST_NAME_INDIVIDUAL_BO = "Enter their last name",
  LAST_NAME = "Enter the individual person’s last name",
  FORMER_NAME = "Enter the individual person’s former name or names",
  ROLE = "Enter a description of the individual person’s role and responsibilities",
  ROLE_AND_RESPONSIBILITIES_CORPORATE = "Enter a description of the corporate managing officer’s role and responsibilities",
  ROLE_AND_RESPONSIBILITIES_INDIVIDUAL = "Enter a description of the individual managing officer’s role and responsibilities",
  NATIONALITY = "Enter the individual person’s nationality",
  NATIONALITY_INDIVIDUAL_BO = "Start typing, then select a nationality from the list",
  SECOND_NATIONALITY_IS_SAME = "Second nationality must be different to their first nationality",
  SECOND_NATIONALITY_IS_SAME_INDIVIDUAL_BO = "Second nationality should not be the same as the nationality given",
  NATIONALITIES_TOO_LONG = "The nationalities you have chosen are longer than 50 characters in total, please choose fewer nationalities",
  OCCUPATION = "Enter an occupation",
  DUE_DILIGENCE_NAME = "Enter the name of the agent that carried out identity checks",
  OE_DUE_DILIGENCE_NAME = "Enter the name of the person or company that carried out identity checks",
  OE_QUERY_NUMBER = "Enter the OE number",
  AGENT_CODE = "Enter the agent assurance code",
  PARTNER_NAME = "Enter the name of the person with overall responsibility for identity checks",
  SUPERVISORY_NAME = "Enter the name of the supervisory body",
  BENEFICIAL_OWNER_OTHER_NAME="Enter the other legal entity’s name",
  BO_GOV_NAME = "Enter the name of the government or public authority",
  HISTORICAL_BENEFICIAL_OWNER_ROLE = "Select if the former beneficial owner is an individual or a legal entity",
  HISTORICAL_BO_CORPORATE_NAME = "Enter the beneficial owner's name",
  HISTORICAL_BO_FIRST_NAME = "Enter the beneficial owner's first name",
  HISTORICAL_BO_LAST_NAME = "Enter the beneficial owner's last name",
  LEGAL_ENTITY_BO_NAME = "Enter its name",
  ENTITY_CORRESPONDENCE_ADDRESS = "Enter their correspondence address",

  // Public Register
  PUBLIC_REGISTER_NAME = "Enter the name of the register",
  PUBLIC_REGISTER_NUMBER = "Enter the registration number",
  PUBLIC_REGISTER_JURISDICTION = "Enter the jurisdiction",
  MUST_ADD_BENEFICIAL_OWNER = "You need to add at least one beneficial owner",
  MUST_ADD_MANAGING_OFFICER = "You need to add at least one managing officer",
  ENTITY_REGISTRATION_NUMBER = "Enter the entity’s registration number",

  // Address
  PROPERTY_NAME_OR_NUMBER = "Enter a property name or number",
  PROPERTY_NAME_OR_NUMBER_INDIVIDUAL_BO = "Enter the property name or number",
  PROPERTY_NAME_OR_NUMBER_LEGAL_ENTITY_BO = "Enter the property name or number",
  ADDRESS_LINE1 = "Enter an address",
  ADDRESS_LINE1_INDIVIDUAL_BO = "Enter address line 1",
  ADDRESS_LINE1_LEGAL_ENTITY_BO = "Enter address line 1",
  CITY_OR_TOWN = "Enter a city or town",
  CITY_OR_TOWN_INDIVIDUAL_BO = "Enter the city or town",
  CITY_OR_TOWN_LEGAL_ENTITY_BO = "Enter the city or town",
  COUNTY = "Enter a county",
  COUNTRY = "Select a country from the list",
  COUNTRY_INDIVIDUAL_BO = "Start typing, then select a country from the list",
  COUNTRY_LEGAL_ENTITY_BO = "Start typing, then select a country from the list",
  UK_COUNTRY = "Select a country",
  POSTCODE = "Enter a postcode",

  // Trusts
  TRUST_DATA_EMPTY = "Paste the trust information from the Excel document into the box",
  TRUST_NAME = "Enter the trust name",
  TRUST_NAME_2 = "Enter the name of the trust",
  TRUST_CREATION_DATE = "Enter the trust creation date",
  TRUST_BO_CHECKBOX = "At least one listed beneficial owner must be selected",
  TRUST_INDIVIDUAL_HOME_ADDRESS_LENGTH = "Individual home address must be 50 characters or less",
  TRUST_INDIVIDUAL_CORRESPONDENCE_ADDRESS_LENGTH = "Individual correspondence address must be 50 characters or less",
  TRUST_CORPORATE_REGISTERED_OFFICE_ADDRESS_LENGTH = "Corporate registered office address must be 50 characters or less",
  TRUST_CORPORATE_CORRESPONDENCE_ADDRESS_LENGTH = "Corporate correspondence address must be 50 characters or less",
  TRUST_INVOLVED_INVALID = 'Select which type of individual or entity you want to add',
  TRUST_HAS_ALL_INFO = 'Select yes if the entity has all the required information about the trust',
  TRUST_INVOLVED_BOS = 'Select the beneficial owners which are involved in the trust',
  TRUST_INDIVIDUAL_ROLE = "Select their role within the trust",
  TRUST_INDIVIDUAL_ROLE_INDIVIDUAL_BO = TRUST_INDIVIDUAL_ROLE,
  LEGAL_ENTITY_BO_ROLE = "Select its role within the trust",
  ADD_TRUST = "Select yes if you need to add another trust",

  // Date
  DAY = "Date must include a day",
  MONTH = "Date must include a month",
  DAY_OF_TRUST = "The date the trust was created must include a day",
  MONTH_OF_TRUST = "The date the trust was created must include a month",
  YEAR_OF_TRUST = "The date the trust was created must include a year",
  YEAR_LENGTH_OF_TRUST = "The year of the date the trust was created must include 4 numbers",
  DAY_LENGTH_OF_TRUST = "The day the trust was created must include 1 or 2 numbers",
  MONTH_LENGTH_OF_TRUST = "The month the trust was created must include 1 or 2 numbers",
  YEAR = "Date must include a year",
  YEAR_LENGTH = "Year must include 4 numbers",
  DAY_LENGTH = "Day must include 1 or 2 numbers",
  MONTH_LENGTH = "Month must include 1 or 2 numbers",
  DAY_OF_BIRTH = "Date of birth must include a day",
  MONTH_OF_BIRTH = "Date of birth must include a month",
  YEAR_OF_BIRTH = "Date of birth must include a year",
  DATE_OF_BIRTH_YEAR_LENGTH = "Date of birth year must include 4 numbers",
  DATE_OF_BIRTH_DAY_LENGTH = "Date of birth day must include 1 or 2 numbers",
  DATE_OF_BIRTH_MONTH_LENGTH = "Date of birth month must include 1 or 2 numbers",
  ENTER_DATE_OF_BIRTH = "Enter the individual person’s date of birth",
  ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO = "Enter their date of birth",
  ENTER_DATE = "Enter the date",
  ENTER_DATE_INTERESTED_PERSON_INDIVIDUAL_BO = "Enter the date they became an interested person",
  ENTER_DATE_INTERESTED_PERSON_LEGAL_ENTITY_BO = "Enter the date it became an interested person",
  ENTER_DATE_OF_TRUST = "Enter the date the trust was created",
  INVALID_DATE = "Date must be a real date",
  INVALID_DAY = "Day must be a real day",
  INVALID_MONTH = "Month must be a real month",
  INVALID_DATE_OF_TRUST = "The date the trust was created must be a real date",
  INVALID_DATE_OF_BIRTH = "Date of birth must be a real date",
  DATE_OF_BIRTH_NOT_IN_PAST = "Date of birth must be in the past",
  DATE_NOT_IN_PAST_OR_TODAY = "Date must be today or in the past",
  DATE_NOT_IN_PAST_OR_TODAY_OF_TRUST = "The date the trust was created must be today or in the past",
  DATE_NOT_IN_THE_PAST_INTERESTED_PERSON = "Date must be in the past",
  IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS = "The date the identity checks were completed must be in the past 3 months",
  DAY_AND_MONTH = "Date must include a day and month",
  DAY_AND_MONTH_OF_TRUST = "The trust date must include a day and month",
  MONTH_AND_YEAR = "Date must include a month and year",
  MONTH_AND_YEAR_OF_TRUST = "The trust date must include a month and year",
  DAY_AND_YEAR = "Date must include a day and year",
  DAY_AND_YEAR_OF_TRUST = "The trust date must include a day and year",
  DAY_AND_MONTH_OF_BIRTH = "Date of birth must include a day and month",
  MONTH_AND_YEAR_OF_BIRTH = "Date of birth must include a month and year",
  DAY_AND_YEAR_OF_BIRTH = "Date of birth must include a day and year",
  ENTER_START_DATE_HISTORICAL_BO = "Enter the date they became a beneficial owner",
  ENTER_END_DATE_HISTORICAL_BO = "Enter the date they stopped being a beneficial owner",
  START_DAY_HISTORICAL_BO = "The date they became a beneficial owner must include a day",
  START_MONTH_HISTORICAL_BO = "The date they became a beneficial owner must include a month",
  START_YEAR_HISTORICAL_BO = "The date they became a beneficial owner must include a year",
  INVALID_START_DATE_HISTORICAL_BO = "The date they became a beneficial owner must be a real date",
  INVALID_END_DATE_HISTORICAL_BO = "The date they stopped being a beneficial owner must be a real date",
  START_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO = "The date they became a beneficial owner must be today or in the past",
  END_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO = "The date they stopped being a beneficial owner must be today or in the past",
  START_DAY_AND_MONTH_HISTORICAL_BO = "The date they became a beneficial owner must include a day and month",
  END_DAY_AND_MONTH_HISTORICAL_BO = "The date they stopped being a beneficial owner must include a day and month",
  START_MONTH_AND_YEAR_HISTORICAL_BO = "The date they became a beneficial owner must include a month and year",
  START_DAY_AND_YEAR_HISTORICAL_BO = "The date they became a beneficial owner must include a day and year",
  START_YEAR_LENGTH_HISTORICAL_BO = "The date they became a beneficial owner year must include 4 numbers",
  START_DAY_LENGTH_HISTORICAL_BO = "The date they became a beneficial owner day must include 1 or 2 numbers",
  START_MONTH_LENGTH_HISTORICAL_BO = "The date they became a beneficial owner month must include 1 or 2 numbers",
  START_END_DATE_HISTORICAL_BO = "The date they became a beneficial owner month must be before the end date",
  END_MONTH_AND_YEAR_HISTORICAL_BO = "The date they stopped being a beneficial owner must include a month and year",
  END_DAY_AND_YEAR_HISTORICAL_BO = "The date they stopped being a beneficial owner must include a month and year",
  END_DAY_HISTORICAL_BO = "The date they stopped being a beneficial owner must include a day",
  END_MONTH_HISTORICAL_BO = "The date they stopped being a beneficial owner must include a month",
  END_YEAR_HISTORICAL_BO = "The date they stopped being a beneficial owner must include a year",
  END_DAY_LENGTH_HISTORICAL_BO = "The date they stopped being a beneficial owner day must include 1 or 2 numbers",
  END_MONTH_LENGTH_HISTORICAL_BO = "The date they stopped being a beneficial owner month must include 1 or 2 numbers",
  END_YEAR_LENGTH_HISTORICAL_BO = "The date they stopped being a beneficial owner year must include 4 numbers",
  CEASED_DATE_BEFORE_START_DATE = "Ceased date must be on or after the appointed date",

  // No radio selected
  SELECT_IF_ENTITY_HAS_SOLD_LAND = "Select yes if the entity has disposed of UK property or land since 28 February 2022",
  SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME = "Select yes if the individual person has any former names",
  SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN = "Select yes if the overseas entity is already on a public register in the country it was formed in",
  SELECT_IF_MANAGING_OFFICER_REGISTER_IN_COUNTRY_FORMED_IN = "Select yes if the corporate managing officer is already on a public register in the country it was formed",
  SELECT_IF_BENEFICIAL_OWNER_OTHER_REGISTER_IN_COUNTRY_FORMED_IN = "Select yes if the other legal entity is already on a public register in the country it was formed in",
  SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS = "Select yes if the correspondence address is the same as the principal or registered office address",
  SELECT_IF_MANAGING_OFFICER_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS = "Select yes if the corporate managing officer’s correspondence address is the same as the principal or registered office address",
  SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS = "Select yes if the correspondence address is the same as their home address",
  SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_INDIVIDUAL_BO = "Select yes if their correspondence address is the same as their home address",
  SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_LEGAL_ENTITY_BO = "Select yes if the correspondence address is the same as the principal address",
  SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED = "Select if any beneficial owners have been identified",
  SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD = "Select the type of beneficial owner or managing officer you want to add",
  SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_YOU_WANT_TO_ADD = "Select the type of beneficial owner you want to add",
  SELECT_THE_TYPE_OF_MANAGING_OFFICER_YOU_WANT_TO_ADD = "Select the type of managing officer you want to add",
  SELECT_IF_SECURE_REGISTER_FILTER = "Select yes if any of the entity’s beneficial owners have ever applied to protect personal information at Companies House",
  SELECT_WHO_IS_MAKING_FILING = "Select who is completing this registration",
  SELECT_WHO_IS_MAKING_UPDATE_FILING = "Select who is completing this update",
  CHECK_DILIGENCE = "Check and confirm the statement of compliance",
  SELECT_IF_ON_SANCTIONS_LIST = "Select yes if it is on the sanctions list",
  SELECT_NATURE_OF_CONTROL = "Select the nature of control",
  SELECT_IF_YOU_WANT_TO_CHANGE_INFORMATION = "Select yes if you want to change this information",
  SELECT_IF_SIGN_OUT = "Select yes if you are sure you want to sign out",
  SELECT_IF_CONTINUE_SAVED_APPLICATION = "Select yes if you want to continue with a saved application",
  SELECT_IF_ON_PUBLIC_REGISTER_IN_COUNTRY_FORMED_IN = "Select yes if it is already on a public register in the country it was formed in",
  SELECT_IF_REGISTRABLE_BENEFICIAL_OWNER = "Select if anyone has become or ceased to be a registrable beneficial owner during the update period",
  UPDATE_SELECT_IF_CONTINUE_SAVED_FILING = "Select yes if you want to continue with a saved filing",
  SELECT_IF_STILL_BENEFICIAL_OWNER = "Select yes if they are still a registrable beneficial owner",
  // MAX Lengths
  MAX_FIRST_NAME_LENGTH = "First name must be 50 characters or less",
  MAX_FIRST_NAME_LENGTH_INDIVIDUAL_BO = MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH = "Last name must be 160 characters or less",
  MAX_FORMER_NAME_LENGTH = "Former names must be 260 characters or less",
  MAX_NAME_LENGTH = "Name must be 160 characters or less",
  MAX_LAST_NAME_LENGTH_50 = "Last name must be 50 characters or less",
  MAX_NAME_LENGTH_TRUST = "Name of the trust must be 160 characters or less",
  MAX_NAME_LENGTH_DUE_DILIGENCE = "Name must be 256 characters or less",
  MAX_FULL_NAME_LENGTH = "Full name must be 256 characters or less",
  MAX_AGENT_NAME_LENGTH = "Agent’s name must be 256 characters or less",
  MAX_SUPERVISORY_NAME_LENGTH = "Name of supervisory body must be 256 characters or less",
  MAX_PARTNER_NAME_LENGTH = "Name of person with overall responsibility must be 256 characters or less",
  MAX_EMAIL_LENGTH = "Email address must be 256 characters or less",
  MAX_PROPERTY_NAME_OR_NUMBER_LENGTH = "Property name or number must be 50 characters or less",
  MAX_ADDRESS_LINE1_LENGTH = "Address line 1 must be 50 characters or less",
  MAX_ADDRESS_LINE2_LENGTH = "Address line 2 must be 50 characters or less",
  MAX_CITY_OR_TOWN_LENGTH = "City or town must be 50 characters or less",
  MAX_COUNTY_LENGTH = "County, state, province or region must be 50 characters or less",
  MAX_POSTCODE_LENGTH = "Postcode must be 15 characters or less",
  MAX_ENTITY_PUBLIC_REGISTER_NAME_AND_JURISDICTION_LENGTH = "Name of register and jurisdiction must be 159 characters or less in total",
  MAX_ENTITY_PUBLIC_REGISTER_NUMBER_LENGTH = "Registration number must be 32 characters or less",
  MAX_ENTITY_LEGAL_FORM_LENGTH = "Legal form must be 160 characters or less",
  MAX_ENTITY_LAW_GOVERNED_LENGTH = "Governing law must be 160 characters or less",
  MAX_LEGAL_FORM_LENGTH = "Legal form must be 160 characters or less",
  MAX_LAW_GOVERNED_LENGTH = "Governing law must be 160 characters or less",
  MAX_PUBLIC_REGISTER_NAME_LENGTH = "Name of register must be 160 characters or less",
  MAX_PUBLIC_REGISTER_NUMBER_LENGTH = "Registration number must be 160 characters or less",
  MAX_OCCUPATION_LENGTH = "Occupation must be 100 characters or less",
  MAX_ROLE_LENGTH = "Role and responsibilities must be 256 characters or less",
  MAX_AML_NUMBER_LENGTH = "AML registration number must be 256 characters or less",
  MAX_AGENT_ASSURANCE_CODE_LENGTH = "Agent assurance code must be 256 characters or less",
  MAX_HISTORICAL_BO_CORPORATE_NAME_LENGTH = "Legal entity’s name must be 160 characters or less",
  NAME_REGISTRATION_JURISDICTION_LEGAL_ENTITY_BO = "Name of register and jurisdiction must be 160 characters or less in total",
  MAX_ENTITY_REGISTRATION_NUMBER = "Entity's registration number must be 160 characters or less",

  // Invalid characters
  FULL_NAME_INVALID_CHARACTERS = "Full name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  FIRST_NAME_INVALID_CHARACTERS = "First name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  LAST_NAME_INVALID_CHARACTERS = "Last name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  NATIONALITY_INVALID_CHARACTERS = "Nationality must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  SECOND_NATIONALITY_INVALID_CHARACTERS = "Second Nationality must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS = "Property name or number must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  ADDRESS_LINE_1_INVALID_CHARACTERS = "Address line 1 must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  ADDRESS_LINE_2_INVALID_CHARACTERS = "Address line 2 must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  CITY_OR_TOWN_INVALID_CHARACTERS = "City or town must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS = "County, state, province or region must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  POSTCODE_ZIPCODE_INVALID_CHARACTERS = "Postcode or ZIP code must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  NAME_INVALID_CHARACTERS = "Name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  NAME_INVALID_CHARACTERS_TRUST = "Trust name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  PUBLIC_REGISTER_NAME_INVALID_CHARACTERS = "Name of register must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  PUBLIC_REGISTER_JURISDICTION_INVALID_CHARACTERS = "Jurisdiction must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS = "Registration number must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  ENTITY_NAME_INVALID_CHARACTERS = "The name of the overseas entity must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  LEGAL_FORM_INVALID_CHARACTERS = "Legal form must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  LAW_GOVERNED_INVALID_CHARACTERS = "Governing law must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  FORMER_NAMES_INVALID_CHARACTERS = "Former name or names must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  OCCUPATION_INVALID_CHARACTERS = "Occupation must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS = "Role and responsibilities must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  CONTACT_NAME_INVALID_CHARACTERS = "Contact name must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
  EMAIL_INVALID_FORMAT = "Enter an email address in the correct format, like name@example.com",
  INVALID_OE_NUMBER = "OE number must be \"OE\" followed by 6 digits",
  INVALID_ENTITY_REGISTRATION_NUMBER = "Entity’s registration number must only include letters a to z, numbers, and special characters such as hyphens, spaces and apostrophes",
}
