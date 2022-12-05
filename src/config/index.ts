import { getEnvironmentValue } from "../utils/environment.value";

// APP CONFIGs
export const APPLICATION_NAME = "overseas-entities-web";
export const NODE_ENV = process.env["NODE_ENV"];
export const PORT = getEnvironmentValue("PORT", "3000");
export const CDN_HOST = getEnvironmentValue("CDN_HOST");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");
export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue("DEFAULT_SESSION_EXPIRATION", "3600");
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");
export const API_URL = getEnvironmentValue("API_URL");
export const CHS_URL = getEnvironmentValue("CHS_URL");
export const CHS_API_KEY = getEnvironmentValue("CHS_API_KEY");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");
export const PIWIK_START_GOAL_ID = getEnvironmentValue("PIWIK_START_GOAL_ID");
export const PAYMENT_FEE = getEnvironmentValue("PAYMENT_FEE");
export const LANDING_PAGE_URL = getEnvironmentValue("LANDING_PAGE_URL");
export const UPDATE_LANDING_PAGE_URL = getEnvironmentValue("UPDATE_LANDING_PAGE_URL");
export const OAUTH2_CLIENT_ID = getEnvironmentValue(`OAUTH2_CLIENT_ID`);
export const OAUTH2_CLIENT_SECRET = getEnvironmentValue(`OAUTH2_CLIENT_SECRET`);
export const ACCOUNT_URL = getEnvironmentValue("ACCOUNT_URL");
export const VF01_FORM_DOWNLOAD_URL = getEnvironmentValue("VF01_FORM_DOWNLOAD_URL");

export const REFRESH_TOKEN_GRANT_TYPE = 'refresh_token';
export const SERVICE_NAME = 'Register an overseas entity and tell us about its beneficial owners';
export const DESCRIPTION = "Overseas Entities Transaction";
export const REFERENCE = "OverseasEntitiesReference";
export const PAYMENT_REQUIRED_HEADER = "x-payment-required";
export const PAYMENT_PAID = "paid";

//  FEATURE FLAGS
export const SHOW_SERVICE_OFFLINE_PAGE = getEnvironmentValue("SHOW_SERVICE_OFFLINE_PAGE");
export const FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 = getEnvironmentValue("FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022", "false");
export const FEATURE_FLAG_ENABLE_TRUSTS_WEB = getEnvironmentValue('FEATURE_FLAG_ENABLE_TRUSTS_WEB_07112022', 'false');
export const FEATURE_FLAG_ENABLE_ROE_UPDATE = getEnvironmentValue('FEATURE_FLAG_ENABLE_ROE_UPDATE_24112022', 'false');
export const FEATURE_FLAG_ENABLE_ROE_REMOVE = getEnvironmentValue('FEATURE_FLAG_ENABLE_ROE_REMOVE_24112022', 'false');

// TEMPLATEs
export const ACCESSIBILITY_STATEMENT_PAGE = "accessibility-statement";
export const BENEFICIAL_OWNER_GOV_PAGE = "beneficial-owner-gov";
export const BENEFICIAL_OWNER_INDIVIDUAL_PAGE = "beneficial-owner-individual";
export const BENEFICIAL_OWNER_OTHER_PAGE = "beneficial-owner-other";
export const BENEFICIAL_OWNER_STATEMENTS_PAGE = "beneficial-owner-statements";
export const BENEFICIAL_OWNER_TYPE_PAGE = "beneficial-owner-type";
export const BENEFICIAL_OWNER_DELETE_WARNING_PAGE = "beneficial-owner-delete-warning";
export const CANNOT_USE_PAGE = "cannot-use";
export const CHECK_YOUR_ANSWERS_PAGE = "check-your-answers";
export const CONFIRMATION_PAGE = "confirmation";
export const DUE_DILIGENCE_PAGE = "due-diligence";
export const ENTITY_PAGE = "entity";
export const ERROR_PAGE = "error-page";
export const HEALTHCHECK_PAGE = "healthcheck";
export const INTERRUPT_CARD_PAGE = "interrupt-card";
export const LANDING_PAGE = "landing";
export const UPDATE_LANDING_PAGE = "update-landing";
export const OVERSEAS_ENTITY_QUERY_PAGE = "overseas-entity-query";
export const MANAGING_OFFICER_PAGE = "managing-officer";
export const MANAGING_OFFICER_CORPORATE_PAGE = "managing-officer-corporate";
export const NOT_FOUND_PAGE = "page-not-found";
export const OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE = "overseas-entity-due-diligence";
export const PRESENTER_PAGE = "presenter";
export const SECURE_REGISTER_FILTER_PAGE = "secure-register-filter";
export const SERVICE_OFFLINE_PAGE = "service-offline";
export const SOLD_LAND_FILTER_PAGE = "sold-land-filter";
export const TRUST_INFO_PAGE = "trust-information";
export const USE_PAPER_PAGE = "use-paper";
export const WHO_IS_MAKING_FILING_PAGE = "who-is-making-filing";
export const SIGN_OUT_PAGE = "sign-out";
export const TRUST_DETAILS_PAGE = "trust-details";
export const CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE = "confirm-overseas-entity-details";

// ROUTING PATHs
export const LANDING_URL = "/register-an-overseas-entity";
export const UPDATE_LANDING_URL = "/update-an-overseas-entity";

export const REGISTER_AN_OVERSEAS_ENTITY_URL = LANDING_URL + "/";
export const UPDATE_AN_OVERSEAS_ENTITY_URL = UPDATE_LANDING_URL + "/";
export const INTERRUPT_CARD_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + INTERRUPT_CARD_PAGE;
export const OVERSEAS_ENTITY_QUERY_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + OVERSEAS_ENTITY_QUERY_PAGE;
export const BENEFICIAL_OWNER_GOV_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_GOV_PAGE;
export const BENEFICIAL_OWNER_STATEMENTS_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_STATEMENTS_PAGE;
export const BENEFICIAL_OWNER_TYPE_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_TYPE_PAGE;
export const BENEFICIAL_OWNER_OTHER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_OTHER_PAGE;
export const BENEFICIAL_OWNER_DELETE_WARNING_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_DELETE_WARNING_PAGE;
export const CANNOT_USE_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + CANNOT_USE_PAGE;
export const CHECK_YOUR_ANSWERS_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + CHECK_YOUR_ANSWERS_PAGE;
export const ENTITY_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + ENTITY_PAGE;
export const MANAGING_OFFICER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + MANAGING_OFFICER_PAGE;
export const MANAGING_OFFICER_CORPORATE_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + MANAGING_OFFICER_CORPORATE_PAGE;
export const PRESENTER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + PRESENTER_PAGE;
export const BENEFICIAL_OWNER_INDIVIDUAL_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_INDIVIDUAL_PAGE;
export const CONFIRMATION_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + CONFIRMATION_PAGE;
export const HEALTHCHECK_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + HEALTHCHECK_PAGE;
export const SOLD_LAND_FILTER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + SOLD_LAND_FILTER_PAGE;
export const SECURE_REGISTER_FILTER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + SECURE_REGISTER_FILTER_PAGE;
export const TRUST_INFO_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + TRUST_INFO_PAGE;
export const USE_PAPER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + USE_PAPER_PAGE;
export const WHO_IS_MAKING_FILING_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + WHO_IS_MAKING_FILING_PAGE;
export const DUE_DILIGENCE_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + DUE_DILIGENCE_PAGE;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE;
export const ACCESSIBILITY_STATEMENT_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + ACCESSIBILITY_STATEMENT_PAGE;
export const SIGN_OUT_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + SIGN_OUT_PAGE;
export const CONFIRM_OVERSEAS_COMPANY_PROFILES_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE;
export const ACCOUNTS_SIGN_OUT_URL = `${ACCOUNT_URL}/signout`;
export const REMOVE = "/remove";
export const TRUST_DETAILS_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + TRUST_DETAILS_PAGE;

// URL PARAMS
export const ID = "/:id"; // Same param name as the ID in the data model

// PAYMENT CONFIGs
export const PAYMENT = "payment";
export const TRANSACTION = "transaction";
export const OVERSEAS_ENTITY = "overseas-entity";

const TRANSACTION_PATH = TRANSACTION + "/:transactionId/";
const OVERSEAS_ENTITY_PATH = OVERSEAS_ENTITY + "/:overseaEntityId/";
export const PAYMENT_WITH_TRANSACTION_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + TRANSACTION_PATH + OVERSEAS_ENTITY_PATH + PAYMENT;

// Resume submission
export const RESUME = "resume";
export const RESUME_SUBMISSION_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + TRANSACTION_PATH + OVERSEAS_ENTITY_PATH + RESUME;

// Change links
export const CHANGE_PRINCIPAL_ADDRESS = "#principal_address_property_name_number";
export const IS_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS = "#is_service_address_same_as_principal_address";
export const CHANGE_SERVICE_ADDRESS = "#service_address_property_name_number";
export const CHANGE_RESIDENTIAL_ADDRESS = "#usual_residential_address_property_name_number";
export const IS_SERVICE_ADDRESS_SAME_AS_USUAL_RESIDENTIAL_ADDRESS = "#is_service_address_same_as_usual_residential_address";
export const IDENTITY_ADDRESS = "#identity_address_property_name_number";
export const NAME = "#name";
export const HAS_FORMER_NAMES = "#has_former_names";
export const FORMER_NAMES = "#former_names";
export const EMAIL = "#email";
export const LEGAL_FORM = "#legal_form";
export const LAW_GOVERNED = "#law_governed";
export const FIRST_NAME = "#first_name";
export const LAST_NAME = "#last_name";
export const NATIONALITY = "#nationality";
export const OCCUPATION = "#occupation";
export const DATE_OF_BIRTH = "#date_of_birth-day";
export const START_DATE = "#start_date-day";
export const IDENTITY_DATE = "#identity_date-day";
export const IS_ON_SANCTIONS_LIST = "#is_on_sanctions_list";
export const NOC_TYPES = "#beneficial_owner_nature_of_control_types";
export const SUPERVISORY_NAME = "#supervisory_name";
export const AML_NUMBER = "#aml_number";
export const PARTNER_NAME = "#partner_name";
export const IS_ON_REGISTER_IN_COUNTRY_FORMED_IN = "#is_on_register_in_country_formed_in";
export const PUBLIC_REGISTER_NAME = "#public_register_name";
export const ROLE_AND_RESPONSIBILITIES = "#role_and_responsibilities";
export const CONTACT_FULL_NAME = "#contact_full_name";
export const CONTACT_EMAIL = "#contact_email";

export const PRESENTER_CHANGE_FULL_NAME = PRESENTER_URL + "#full_name";
export const PRESENTER_CHANGE_EMAIL = PRESENTER_URL + EMAIL;
export const ENTITY_CHANGE_NAME = ENTITY_URL + NAME;
export const ENTITY_CHANGE_COUNTRY = ENTITY_URL + "#incorporation_country";
export const ENTITY_CHANGE_PRINCIPAL_ADDRESS = ENTITY_URL + CHANGE_PRINCIPAL_ADDRESS;
export const ENTITY_CHANGE_CORRESPONDENCE_ADDRESS = ENTITY_URL + CHANGE_SERVICE_ADDRESS;
export const ENTITY_CHANGE_EMAIL = ENTITY_URL + EMAIL;
export const ENTITY_CHANGE_LEGAL_FORM = ENTITY_URL + LEGAL_FORM;
export const ENTITY_CHANGE_GOVERNING_LAW = ENTITY_URL + LAW_GOVERNED;
export const ENTITY_CHANGE_PUBLIC_REGISTER = ENTITY_URL + "#is_on_register_in_country_formed_in";
export const CONCATENATED_VALUES_SEPARATOR = ",";

export const DUE_DILIGENCE_CHANGE_WHO = WHO_IS_MAKING_FILING_URL;
export const DUE_DILIGENCE_CHANGE_IDENTITY_DATE = DUE_DILIGENCE_URL + IDENTITY_DATE;
export const DUE_DILIGENCE_CHANGE_NAME = DUE_DILIGENCE_URL + NAME;
export const DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS = DUE_DILIGENCE_URL + IDENTITY_ADDRESS;
export const DUE_DILIGENCE_CHANGE_EMAIL = DUE_DILIGENCE_URL + EMAIL;
export const DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME = DUE_DILIGENCE_URL + SUPERVISORY_NAME;
export const DUE_DILIGENCE_CHANGE_AML_NUMBER = DUE_DILIGENCE_URL + AML_NUMBER;
export const DUE_DILIGENCE_CHANGE_AGENT_CODE = DUE_DILIGENCE_URL + "#agent_code";
export const DUE_DILIGENCE_CHANGE_PARTNER_NAME = DUE_DILIGENCE_URL + PARTNER_NAME;

export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_DATE = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + IDENTITY_DATE;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_NAME = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + NAME;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + IDENTITY_ADDRESS;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_EMAIL = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + EMAIL;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + SUPERVISORY_NAME;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_AML_NUMBER = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + AML_NUMBER;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_PARTNER_NAME = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + PARTNER_NAME;
