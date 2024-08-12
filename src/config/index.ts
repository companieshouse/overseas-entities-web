import { getEnvironmentValue } from "../utils/environment.value";

// APP CONFIGs
export const APPLICATION_NAME = "overseas-entities-web";
export const NODE_ENV = process.env["NODE_ENV"];
export const PORT = getEnvironmentValue("PORT", "3000");
export const CDN_HOST = getEnvironmentValue("CDN_HOST");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");
export const COOKIE_NAME = getEnvironmentValue("COOKIE_NAME");
export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue("DEFAULT_SESSION_EXPIRATION", "3600");
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");
export const PAYMENTS_API_URL = getEnvironmentValue("PAYMENTS_API_URL");
export const API_URL = getEnvironmentValue("API_URL");
export const CHS_URL = getEnvironmentValue("CHS_URL");
export const CHS_API_KEY = getEnvironmentValue("CHS_API_KEY");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");
export const PIWIK_START_GOAL_ID = getEnvironmentValue("PIWIK_START_GOAL_ID");
export const PIWIK_UPDATE_START_GOAL_ID = getEnvironmentValue("PIWIK_UPDATE_START_GOAL_ID");
export const PIWIK_REMOVE_START_GOAL_ID = getEnvironmentValue("PIWIK_REMOVE_START_GOAL_ID");
export const PIWIK_RELEVANT_PERIOD_START_GOAL_ID = getEnvironmentValue("PIWIK_RELEVANT_PERIOD_START_GOAL_ID");
export const PAYMENT_FEE = getEnvironmentValue("PAYMENT_FEE");
export const UPDATE_PAYMENT_FEE = getEnvironmentValue("UPDATE_PAYMENT_FEE");
export const LANDING_PAGE_URL = getEnvironmentValue("LANDING_PAGE_URL");
export const LANDING_PAGE_STARTING_NEW_URL = getEnvironmentValue("LANDING_PAGE_STARTING_NEW_URL");
export const UPDATE_LANDING_PAGE_URL = getEnvironmentValue("UPDATE_LANDING_PAGE_URL");
export const REMOVE_LANDING_PAGE_URL = getEnvironmentValue("REMOVE_LANDING_PAGE_URL");
export const OAUTH2_CLIENT_ID = getEnvironmentValue(`OAUTH2_CLIENT_ID`);
export const OAUTH2_CLIENT_SECRET = getEnvironmentValue(`OAUTH2_CLIENT_SECRET`);
export const ACCOUNT_URL = getEnvironmentValue("ACCOUNT_URL");
export const VF01_FORM_DOWNLOAD_URL = getEnvironmentValue("VF01_FORM_DOWNLOAD_URL");

export const REFRESH_TOKEN_GRANT_TYPE = 'refresh_token';
export const SERVICE_NAME = 'Register an overseas entity and tell us about its beneficial owners';
export const UPDATE_SERVICE_NAME = 'File an overseas entity update statement';
export const REMOVE_SERVICE_NAME = 'Apply to remove an overseas entity from the register';
export const DESCRIPTION = "Overseas Entities Transaction";
export const REFERENCE = "OverseasEntitiesReference";
export const PAYMENT_REQUIRED_HEADER = "x-payment-required";
export const PAYMENT_PAID = "paid";
export const CLOSED_PENDING_PAYMENT = "closed pending payment";
export const PAYMENTS = "/payments";
export const YOUR_FILINGS_PATH = "/user/transactions";

//  FEATURE FLAGS
export const SHOW_SERVICE_OFFLINE_PAGE = getEnvironmentValue("SHOW_SERVICE_OFFLINE_PAGE");
export const FEATURE_FLAG_ENABLE_TRUSTS_WEB = getEnvironmentValue('FEATURE_FLAG_ENABLE_TRUSTS_WEB_07112022', 'false');
export const FEATURE_FLAG_ENABLE_ROE_UPDATE = getEnvironmentValue('FEATURE_FLAG_ENABLE_ROE_UPDATE_24112022', 'false');
export const FEATURE_FLAG_ENABLE_REDIS_REMOVAL = getEnvironmentValue('FEATURE_FLAG_ENABLE_REDIS_REMOVAL_27092023', 'false');
export const FEATURE_FLAG_ENABLE_CEASE_TRUSTS = getEnvironmentValue('FEATURE_FLAG_ENABLE_CEASE_TRUSTS_19022024', 'false');
export const FEATURE_FLAG_ENABLE_RELEVANT_PERIOD = getEnvironmentValue('FEATURE_FLAG_ENABLE_RELEVANT_PERIOD_26042024', 'false');

// TEMPLATES
export const ACCESSIBILITY_STATEMENT_PAGE = "accessibility-statement";
export const BENEFICIAL_OWNER_GOV_PAGE = "beneficial-owner-gov";
export const BENEFICIAL_OWNER_INDIVIDUAL_PAGE = "beneficial-owner-individual";
export const BENEFICIAL_OWNER_OTHER_PAGE = "beneficial-owner-other";
export const BENEFICIAL_OWNER_STATEMENTS_PAGE = "beneficial-owner-statements";
export const BENEFICIAL_OWNER_TYPE_PAGE = "beneficial-owner-type";
export const UPDATE_BENEFICIAL_OWNER_TYPE_PAGE = "update-beneficial-owner-type";
export const UPDATE_BENEFICIAL_OWNER_OTHER_PAGE = "update-beneficial-owner-other";
export const UPDATE_BENEFICIAL_OWNER_GOV_PAGE = "update-beneficial-owner-gov";
export const BENEFICIAL_OWNER_DELETE_WARNING_PAGE = "beneficial-owner-delete-warning";
export const CANNOT_USE_PAGE = "cannot-use";
export const CHECK_YOUR_ANSWERS_PAGE = "check-your-answers";
export const CONFIRMATION_PAGE = "confirmation";
export const DUE_DILIGENCE_PAGE = "due-diligence";
export const ENTITY_PAGE = "entity";
export const ERROR_PAGE = "error-page";
export const HEALTHCHECK_PAGE = "healthcheck";
export const INTERRUPT_CARD_PAGE = "interrupt-card";
export const UPDATE_LANDING_PAGE = "update-landing";
export const UPDATE_CONFIRMATION_PAGE = "update-confirmation";
export const OVERSEAS_ENTITY_QUERY_PAGE = "overseas-entity-query";
export const MANAGING_OFFICER_PAGE = "managing-officer";
export const MANAGING_OFFICER_CORPORATE_PAGE = "managing-officer-corporate";
export const NOT_FOUND_PAGE = "page-not-found";
export const OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE = "overseas-entity-due-diligence";
export const PRESENTER_PAGE = "presenter";
export const UPDATE_PRESENTER_PAGE = "update-presenter";
export const SECURE_REGISTER_FILTER_PAGE = "secure-register-filter";
export const SECURE_UPDATE_FILTER_PAGE = "secure-update-filter";
export const SERVICE_OFFLINE_PAGE = "service-offline";
export const SOLD_LAND_FILTER_PAGE = "sold-land-filter";
export const TRUST_INFO_PAGE = "trust-information";
export const USE_PAPER_PAGE = "use-paper";
export const WHO_IS_MAKING_FILING_PAGE = "who-is-making-filing";
export const OVERSEAS_NAME_PAGE = "overseas-name";
export const SIGN_OUT_PAGE = "sign-out";
export const STARTING_NEW_PAGE = "starting-new";
export const PAYMENT_FAILED_PAGE = "payment-failed";
export const RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE = "registered-owner-during-pre-registration-period";
export const RELEVANT_PERIOD_INTERRUPT_PAGE = "relevant-period-interrupt-card";
export const RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE = "provide-statements-for-the-pre-registration-period";
export const RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE = "review-statements-for-the-pre-registration-period";
export const TRUST_DETAILS_PAGE = "trust-details";
export const TRUST_INVOLVED_PAGE = "trust-involved";
export const TRUST_HISTORICAL_BENEFICIAL_OWNER_PAGE = "trust-historical-beneficial-owner";
export const TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE = "trust-individual-beneficial-owner";
export const TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE = "trust-legal-entity-beneficial-owner";
export const TRUST_BENEFICIAL_OWNER_DETACH_PAGE = "trust-bo-detach";
export const TRUST_INTERRUPT_PAGE = 'trust-interrupt';
export const ADD_TRUST_PAGE = 'add-trust';
export const WHO_IS_MAKING_UPDATE_PAGE = "who-is-making-update";
export const CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE = "confirm-overseas-entity-details";
export const UPDATE_FILING_DATE_PAGE = "update-filing-date";
export const UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE = "update-beneficial-owner-bo-mo-review";
export const UPDATE_CHECK_YOUR_ANSWERS_PAGE = "update-check-your-answers";
export const UPDATE_DUE_DILIGENCE_PAGE = "update-due-diligence";
export const UPDATE_INTERRUPT_CARD_PAGE = "update-interrupt-card";
export const UPDATE_MANAGING_OFFICER_PAGE = "update-managing-officer";
export const UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE = "review-individual-managing-officer";
export const UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE = "update-beneficial-owner-individual";
export const UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE = "review-beneficial-owner-individual";
export const UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE = "review-beneficial-owner-other";
export const UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE = "review-beneficial-owner-gov";
export const UPDATE_MANAGING_OFFICER_CORPORATE_PAGE = "update-managing-officer-corporate";
export const UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE = "review-managing-officer-corporate";
export const UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE = "update-registrable-beneficial-owner";
export const UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE = "continue-with-saved-filing";
export const UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE = "do-you-want-to-make-oe-change";
export const UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE = "no-change-registrable-beneficial-owner";
export const UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE = "update-trusts-submit-by-paper";
export const UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE = "update-no-change-beneficial-owner-statements";
export const UPDATE_ANY_TRUSTS_INVOLVED_PAGE = "update-any-trusts-involved";
export const UPDATE_REVIEW_STATEMENT_PAGE = "review-update-statement";
export const UPDATE_TRUSTS_SUBMISSION_INTERRUPT_PAGE = "update-trusts-submission-interrupt";
export const UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE = "update-tell-us-about-the-trust";
export const UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE = "update-trusts-individuals-or-entities-involved";
export const UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_PAGE = "update-trusts-associated-with-overseas-entity";
export const UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE = "update-trusts-tell-us-about-individual-bo";
export const UPDATE_TRUSTS_TELL_US_ABOUT_FORMER_BO_PAGE = "update-trusts-tell-us-about-former-bo";
export const UPDATE_TRUSTS_TELL_US_ABOUT_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE = "update-trusts-tell-us-about-legal-entity";
export const UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE = 'update-manage-trusts-interrupt';
export const UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE = 'update-manage-trusts-review-the-trust';
export const UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE = 'update-manage-trusts-review-former-bo';
export const UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE = 'update-manage-trusts-tell-us-about-the-former-bo';
export const UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE = 'update-manage-trusts-review-individuals';
export const UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE = 'update-manage-trusts-tell-us-about-the-individual';
export const UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE = 'update-manage-trusts-review-legal-entities';
export const UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE = 'update-manage-trusts-tell-us-about-the-legal-entity';
export const UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE = 'update-manage-trusts-individuals-or-entities-involved';
export const UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE = "update-statement-validation-errors";

// REMOVE TEMPLATES
export const REMOVE_SOLD_ALL_LAND_FILTER_PAGE = "remove-sold-all-land-filter";
export const REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE = "remove-is-entity-registered-owner";
export const REMOVE_CANNOT_USE_PAGE = "remove-cannot-use";
export const REMOVE_CONFIRM_STATEMENT_PAGE = "remove-confirm-statement";

// URL PARAMS
export const ROUTE_PARAM_TRUST_ID = "trustId";
export const ROUTE_PARAM_BENEFICIAL_OWNER_ID = "boId";
export const ROUTE_PARAM_TRUSTEE_ID = "trusteeId";
export const ROUTE_PARAM_TRUSTEE_TYPE = "trusteeType";
export const ID = "/:id"; // Same param name as the ID in the data model
export const OPTIONAL_ID_PARAM = `${ID}?`;
export const PARAM_BO_MO_TYPE = 'boMoType';
export const PARAM_BENEFICIAL_OWNER_INDIVIDUAL = 'beneficial-owner-individual';
export const PARAM_BENEFICIAL_OWNER_GOV = 'beneficial-owner-gov';
export const PARAM_BENEFICIAL_OWNER_OTHER = 'beneficial-owner-other';
export const PARAM_MANAGING_OFFICER_INDIVIDUAL = 'managing-officer-individual';
export const PARAM_MANAGING_OFFICER_CORPORATE = 'managing-officer-corporate';
export const ROUTE_PARAM_BO_MO_TYPE = `/:${PARAM_BO_MO_TYPE}`;
export const BO_ID = `/:${ROUTE_PARAM_BENEFICIAL_OWNER_ID}`;
export const TRUST_ID = `/:${ROUTE_PARAM_TRUST_ID}`;
export const TRUSTEE_ID = `/:${ROUTE_PARAM_TRUSTEE_ID}`;
export const TRUSTEE_TYPE = `/:${ROUTE_PARAM_TRUSTEE_TYPE}`;
export const GET_COMPANY_OFFICERS_PAGE_SIZE = 100;
export const REVIEW_OWNER_INDEX_PARAM = "?index=";
export const UPDATE_REVIEW_OWNERS_PARAMS = REVIEW_OWNER_INDEX_PARAM + ID;
export const ROUTE_PARAM_TRANSACTION_ID = "transactionId";
export const ROUTE_PARAM_SUBMISSION_ID = "submissionId";
export const LANDING_PAGE_QUERY_PARAM = "start";
export const JOURNEY_QUERY_PARAM = "journey";
export const PREVIOUS_PAGE_QUERY_PARAM = "previousPage";
export const RELEVANT_PERIOD_QUERY_PARAM = "?relevant-period=true";

export const BUTTON_OPTION_YES = '1';
export const BUTTON_OPTION_NO = '0';

export enum JourneyType {
  register = "register",
  update = "update",
  remove = "remove",
}

export const JOURNEY_REMOVE_QUERY_PARAM = `?${JOURNEY_QUERY_PARAM}=${JourneyType.remove}`;

// ROUTING PATHs
export const LANDING_URL = "/register-an-overseas-entity";

export const SUBMIT_URL = "/submit";
export const REGISTER_AN_OVERSEAS_ENTITY_URL = LANDING_URL + "/";
export const INTERRUPT_CARD_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + INTERRUPT_CARD_PAGE;
export const BENEFICIAL_OWNER_GOV_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_GOV_PAGE;
export const BENEFICIAL_OWNER_STATEMENTS_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_STATEMENTS_PAGE;
export const BENEFICIAL_OWNER_TYPE_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_TYPE_PAGE;
export const BENEFICIAL_OWNER_TYPE_SUBMIT_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_TYPE_PAGE + SUBMIT_URL;
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
export const OVERSEAS_NAME_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + OVERSEAS_NAME_PAGE;
export const STARTING_NEW_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + STARTING_NEW_PAGE;
export const PAYMENT_FAILED_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + PAYMENT_FAILED_PAGE;

export const ACCOUNTS_SIGN_OUT_URL = `${ACCOUNT_URL}/signout`;
export const REMOVE = "/remove";

export const TRUSTS_URL = "trusts";
export const TRUST_ENTRY_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + TRUSTS_URL;
export const TRUST_DETAILS_URL = TRUST_ENTRY_URL;
export const TRUST_INVOLVED_URL = '/' + TRUST_INVOLVED_PAGE;
export const ADD_TRUST_URL = '/' + ADD_TRUST_PAGE;
export const TRUST_BENEFICIAL_OWNER_DETACH_URL = '/' + TRUST_BENEFICIAL_OWNER_DETACH_PAGE;
export const TRUST_HISTORICAL_BENEFICIAL_OWNER_URL = '/' + TRUST_HISTORICAL_BENEFICIAL_OWNER_PAGE;
export const TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL = '/' + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE;
export const TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL = '/' + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE;
export const TRUST_TRUSTEE_LEGAL_ENTITY_URL = '/trustee-other-legal';
export const TRUST_INTERRUPT_URL = '/' + TRUST_INTERRUPT_PAGE;

// UPDATE templates
export const UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE = "due-diligence-overseas-entity";
export const UPDATE_SIGN_OUT_PAGE = "sign-out";
export const UPDATE_ACCOUNTS_SIGN_OUT_URL = `${ACCOUNT_URL}/signout`;
export const UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE = "update-review-overseas-entity-information";
export const UPDATE_CONFIRM_TO_REMOVE_PAGE = "confirm-to-remove";

export const UPDATE_MANAGE_TRUSTS_ORCHESTRATOR = 'update-manage-trusts-orchestrator';
export const UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER = 'update-manage-trusts-orchestrator/change';

// UPDATE overseas entity routes
export const UPDATE_LANDING_URL = "/update-an-overseas-entity";

export const UPDATE_AN_OVERSEAS_ENTITY_URL = UPDATE_LANDING_URL + "/";
export const SECURE_UPDATE_FILTER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + SECURE_UPDATE_FILTER_PAGE;
export const UPDATE_USE_PAPER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + USE_PAPER_PAGE;
export const OVERSEAS_ENTITY_QUERY_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + OVERSEAS_ENTITY_QUERY_PAGE;
export const UPDATE_OVERSEAS_ENTITY_CONFIRM_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE;
export const UPDATE_FILING_DATE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_FILING_DATE_PAGE;
export const OVERSEAS_ENTITY_PRESENTER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_PRESENTER_PAGE;
export const UPDATE_CONFIRMATION_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_CONFIRMATION_PAGE;
export const OVERSEAS_ENTITY_UPDATE_DETAILS_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + ENTITY_PAGE;
export const WHO_IS_MAKING_UPDATE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + WHO_IS_MAKING_UPDATE_PAGE;
export const UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE;
export const UPDATE_DUE_DILIGENCE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_DUE_DILIGENCE_PAGE;
export const UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE;
export const UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_BENEFICIAL_OWNER_TYPE_PAGE + SUBMIT_URL;
export const UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE;
export const UPDATE_BENEFICIAL_OWNER_GOV_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_BENEFICIAL_OWNER_GOV_PAGE;
export const UPDATE_BENEFICIAL_OWNER_OTHER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_BENEFICIAL_OWNER_OTHER_PAGE;
export const UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE;
export const UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE;
export const UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE;
export const UPDATE_CONFIRM_TO_REMOVE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_CONFIRM_TO_REMOVE_PAGE;
export const UPDATE_BENEFICIAL_OWNER_TYPE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_BENEFICIAL_OWNER_TYPE_PAGE;
export const UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_TRUSTS_SUBMISSION_INTERRUPT_PAGE;
export const UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE;
export const UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE;
export const UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_PAGE;
export const UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_ORCHESTRATOR;
export const UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_CHANGE_HANDLER;
export const UPDATE_MANAGE_TRUSTS_INTERRUPT_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE;
export const UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE;
export const UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE;
export const UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_PAGE;
export const UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE;
export const UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_PAGE;
export const UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE;
export const UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_PAGE;
export const UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE;
export const UPDATE_CHECK_YOUR_ANSWERS_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_CHECK_YOUR_ANSWERS_PAGE;
export const UPDATE_INTERRUPT_CARD_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_INTERRUPT_CARD_PAGE;
export const UPDATE_SIGN_OUT_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_SIGN_OUT_PAGE;
export const UPDATE_MANAGING_OFFICER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGING_OFFICER_PAGE;
export const UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE;
export const UPDATE_MANAGING_OFFICER_CORPORATE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_MANAGING_OFFICER_CORPORATE_PAGE;
export const UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE;
export const UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_STATEMENTS_PAGE;
export const UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE;
export const UPDATE_CONTINUE_WITH_SAVED_FILING_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE;
export const UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE;
export const UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE;
export const UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE;
export const UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE;
export const UPDATE_REVIEW_STATEMENT_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_REVIEW_STATEMENT_PAGE;
export const UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE;
export const UPDATE_ANY_TRUSTS_INVOLVED_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_ANY_TRUSTS_INVOLVED_PAGE;
export const UPDATE_STATEMENT_VALIDATION_ERRORS_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE;
export const UPDATE_PAYMENT_FAILED_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + PAYMENT_FAILED_PAGE;
export const RELEVANT_PERIOD_OWNED_LAND_FILTER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE;
export const RELEVANT_PERIOD_INTERRUPT_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + RELEVANT_PERIOD_INTERRUPT_PAGE;
export const RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE;
export const RELEVANT_PERIOD_REVIEW_STATEMENTS_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE;

// REMOVE overseas entity routes
export const REMOVE_SECTION = "remove/";
export const REMOVE_URL_IDENTIFIER = "/" + REMOVE_SECTION;
export const REMOVE_SOLD_ALL_LAND_FILTER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + REMOVE_SECTION + REMOVE_SOLD_ALL_LAND_FILTER_PAGE;
export const REMOVE_CANNOT_USE_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + REMOVE_SECTION + REMOVE_CANNOT_USE_PAGE;
export const REMOVE_IS_ENTITY_REGISTERED_OWNER_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + REMOVE_SECTION + REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE;
export const REMOVE_CONFIRM_STATEMENT_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + REMOVE_SECTION + REMOVE_CONFIRM_STATEMENT_PAGE;

// PAYMENT CONFIGs
export const PAYMENT = "payment";
export const TRANSACTION = "transaction";
export const OVERSEAS_ENTITY = "overseas-entity";

const TRANSACTION_PATH = TRANSACTION + "/:transactionId/";
const OVERSEAS_ENTITY_PATH = OVERSEAS_ENTITY + "/:overseaEntityId/";
export const PAYMENT_WITH_TRANSACTION_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + TRANSACTION_PATH + OVERSEAS_ENTITY_PATH + PAYMENT;
export const OVERSEAS_ENTITY_PAYMENT_WITH_TRANSACTION_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + TRANSACTION_PATH + OVERSEAS_ENTITY_PATH + PAYMENT;

// Resume submission
export const RESUME = "resume";
export const RESUME_SUBMISSION_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + TRANSACTION_PATH + OVERSEAS_ENTITY_PATH + RESUME;
export const RESUME_UPDATE_SUBMISSION_URL = UPDATE_AN_OVERSEAS_ENTITY_URL + TRANSACTION_PATH + OVERSEAS_ENTITY_PATH + RESUME;

// Update configs
export const UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL = UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL + REVIEW_OWNER_INDEX_PARAM + ID;
export const UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL_WITH_PARAM_URL = UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL + REVIEW_OWNER_INDEX_PARAM + ID;
export const UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL = UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL + REVIEW_OWNER_INDEX_PARAM + ID;
export const UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL_WITH_PARAM_URL = UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL + REVIEW_OWNER_INDEX_PARAM + ID;
export const UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URLWITH_PARAM_URL = UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL + REVIEW_OWNER_INDEX_PARAM + ID;

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
export const SECOND_NATIONALITY = "#second_nationality";
export const OCCUPATION = "#occupation";
export const DATE_OF_BIRTH = "#date_of_birth-day";
export const START_DATE = "#start_date-day";
export const IDENTITY_DATE = "#identity_date-day";
export const IS_ON_SANCTIONS_LIST = "#is_on_sanctions_list";
export const IS_CEASED = "#is_still_bo";
export const IS_RESIGNED = "#is_still_mo";
export const CEASED_DATE = "#ceased_date-day";
export const RESIGNED_DATE = "#resigned_on-day";
export const NOC_TYPES = "#beneficial_owner_nature_of_control_types";
export const SUPERVISORY_NAME = "#supervisory_name";
export const AML_NUMBER = "#aml_number";
export const PARTNER_NAME = "#partner_name";
export const IS_ON_REGISTER_IN_COUNTRY_FORMED_IN = "#is_on_register_in_country_formed_in";
export const PUBLIC_REGISTER_NAME = "#public_register_name";
export const ROLE_AND_RESPONSIBILITIES = "#role_and_responsibilities";
export const CONTACT_FULL_NAME = "#contact_full_name";
export const CONTACT_EMAIL = "#contact_email";
export const CREATED_DATE = "#createdDateDay";
export const INCORPORATION_COUNTRY = "#incorporation_country";
export const ENTITY_NAME = "#entity_name";
export const ROLE_WITHIN_TRUST = "#roleWithinTrust";
export const FORENAME = "#forename";
export const SURNAME = "#surname";
export const TRUST_DATE_OF_BIRTH = "#dateOfBirthDay";
export const INTERESTED_PERSON_START_DATE = "#dateBecameIPDay";
export const LEGAL_INTERESTED_PERSON_START_DATE = "#interestedPersonStartDateDay";
export const PUBLIC_REGISTER_JURISDICTION = "#public_register_jurisdiction";
export const LEGAL_ENTITY_NAME = "#legalEntityName";
export const TRUST_BENEFICIAL_OWNERS = "#trustBeneficialOwners";
export const TRUSTEE_START_DATE = "#startDateDay";
export const TRUSTEE_END_DATE = "#endDateDay";
export const CORPORATE_NAME = "#corporate_name";
export const INDIVIDUAL_NAME = "#firstName";
export const AGENT_CODE = "#agent_code";
export const SECURE_FILTER = "#is_secure_register";
export const FILING_DATE = "#filing_date";
export const NO_CHANGE = "#no_change";
export const BENEFICIAL_OWNERS_STATEMENT = "#beneficial_owners_statement";
export const REGISTRABLE_BENEFICIAL_OWNER = "#registrable_beneficial_owner";
export const TRUST_STILL_INVOLVED = "#stillInvolved";
export const TRUST_CEASED_DATE = "#ceasedDateDay";

export const ENTITY_CHANGE_NAME = OVERSEAS_NAME_URL + ENTITY_NAME;
export const PRESENTER_CHANGE_FULL_NAME = PRESENTER_URL + "#full_name";
export const PRESENTER_CHANGE_EMAIL = PRESENTER_URL + EMAIL;
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
export const DUE_DILIGENCE_CHANGE_AGENT_CODE = DUE_DILIGENCE_URL + AGENT_CODE;
export const DUE_DILIGENCE_CHANGE_PARTNER_NAME = DUE_DILIGENCE_URL + PARTNER_NAME;

export const UPDATE_DUE_DILIGENCE_CHANGE_WHO = WHO_IS_MAKING_UPDATE_URL;
export const UPDATE_DUE_DILIGENCE_CHANGE_IDENTITY_DATE = UPDATE_DUE_DILIGENCE_URL + IDENTITY_DATE;
export const UPDATE_DUE_DILIGENCE_CHANGE_NAME = UPDATE_DUE_DILIGENCE_URL + NAME;
export const UPDATE_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS = UPDATE_DUE_DILIGENCE_URL + IDENTITY_ADDRESS;
export const UPDATE_DUE_DILIGENCE_CHANGE_EMAIL = UPDATE_DUE_DILIGENCE_URL + EMAIL;
export const UPDATE_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME = UPDATE_DUE_DILIGENCE_URL + SUPERVISORY_NAME;
export const UPDATE_DUE_DILIGENCE_CHANGE_AML_NUMBER = UPDATE_DUE_DILIGENCE_URL + AML_NUMBER;
export const UPDATE_DUE_DILIGENCE_CHANGE_AGENT_CODE = UPDATE_DUE_DILIGENCE_URL + AGENT_CODE;
export const UPDATE_DUE_DILIGENCE_CHANGE_PARTNER_NAME = UPDATE_DUE_DILIGENCE_URL + PARTNER_NAME;

export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_DATE = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + IDENTITY_DATE;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_NAME = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + NAME;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + IDENTITY_ADDRESS;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_EMAIL = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + EMAIL;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + SUPERVISORY_NAME;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_AML_NUMBER = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + AML_NUMBER;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_PARTNER_NAME = OVERSEAS_ENTITY_DUE_DILIGENCE_URL + PARTNER_NAME;

export const UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_DATE = UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL + IDENTITY_DATE;
export const UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_NAME = UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL + NAME;
export const UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_IDENTITY_ADDRESS = UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL + IDENTITY_ADDRESS;
export const UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_EMAIL = UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL + EMAIL;
export const UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_SUPERVISORY_NAME = UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL + SUPERVISORY_NAME;
export const UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_AML_NUMBER = UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL + AML_NUMBER;
export const UPDATE_OVERSEAS_ENTITY_DUE_DILIGENCE_CHANGE_PARTNER_NAME = UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL + PARTNER_NAME;

export const UPDATE_PRESENTER_CHANGE_FULL_NAME = OVERSEAS_ENTITY_PRESENTER_URL + "#full_name";
export const UPDATE_PRESENTER_CHANGE_EMAIL = OVERSEAS_ENTITY_PRESENTER_URL + "#email";
export const SECURE_UPDATE_FILTER_CHANGELINK = SECURE_UPDATE_FILTER_URL + SECURE_FILTER;
export const UPDATE_FILING_DATE_CHANGELINK = UPDATE_FILING_DATE_URL + FILING_DATE;
export const UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_CHANGELINK = UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL + NO_CHANGE;
export const UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_CHANGELINK = UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL + BENEFICIAL_OWNERS_STATEMENT;
export const UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_CHANGELINK = UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL + REGISTRABLE_BENEFICIAL_OWNER;

// page sub-headings
export const OVERSEAS_ENTITY_SECTION_HEADING = "Overseas entity details";

// REGISTRATION URLS WITH PARAMS
export const ACTIVE_SUBMISSION_BASE_PATH = `transaction/:${ROUTE_PARAM_TRANSACTION_ID}/submission/:${ROUTE_PARAM_SUBMISSION_ID}/`;
export const REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + ACTIVE_SUBMISSION_BASE_PATH;
export const SOLD_LAND_FILTER_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + SOLD_LAND_FILTER_PAGE;
export const SECURE_REGISTER_FILTER_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + SECURE_REGISTER_FILTER_PAGE;
export const INTERRUPT_CARD_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + INTERRUPT_CARD_PAGE;
export const OVERSEAS_NAME_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + OVERSEAS_NAME_PAGE;
export const PRESENTER_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + PRESENTER_PAGE;
export const WHO_IS_MAKING_FILING_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + WHO_IS_MAKING_FILING_PAGE;
export const DUE_DILIGENCE_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + DUE_DILIGENCE_PAGE;
export const OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + OVERSEAS_ENTITY_DUE_DILIGENCE_PAGE;
export const ENTITY_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + ENTITY_PAGE;
export const BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + BENEFICIAL_OWNER_STATEMENTS_PAGE;
export const BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + BENEFICIAL_OWNER_TYPE_PAGE;
export const BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + BENEFICIAL_OWNER_TYPE_PAGE + SUBMIT_URL;
export const BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + BENEFICIAL_OWNER_INDIVIDUAL_PAGE;
export const BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + BENEFICIAL_OWNER_OTHER_PAGE;
export const BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + BENEFICIAL_OWNER_GOV_PAGE ;
export const BENEFICIAL_OWNER_DELETE_WARNING_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + BENEFICIAL_OWNER_DELETE_WARNING_PAGE;
export const MANAGING_OFFICER_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + MANAGING_OFFICER_PAGE;
export const MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + MANAGING_OFFICER_CORPORATE_PAGE;
export const CHECK_YOUR_ANSWERS_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + CHECK_YOUR_ANSWERS_PAGE;
export const CONFIRMATION_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + CONFIRMATION_PAGE;
export const SIGN_OUT_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + SIGN_OUT_PAGE;
export const PAYMENT_FAILED_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + PAYMENT_FAILED_PAGE;
export const PAYMENT_WITH_TRANSACTION_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + PAYMENT;

// Trusts with id params
export const TRUST_ENTRY_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + TRUSTS_URL;
export const TRUST_INFO_WITH_PARAMS_URL = REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL + TRUST_INFO_PAGE;
