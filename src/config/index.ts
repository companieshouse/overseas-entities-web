export const getEnvironmentValue = (key: string, defaultValue = ""): string => {
  const value: string = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Please set the environment variable "${key}"`);
  }

  return value;
};

// APP CONFIGs
export const APPLICATION_NAME = "overseas-entities-web";
export const NODE_ENV = process.env["NODE_ENV"];
export const PORT = getEnvironmentValue("PORT", "3000");
export const CDN_HOST = getEnvironmentValue("CDN_HOST");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");
export const SHOW_SERVICE_OFFLINE_PAGE = getEnvironmentValue("SHOW_SERVICE_OFFLINE_PAGE");

// TEMPLATEs
export const BENEFICIAL_OWNER_GOV_PAGE = "beneficial-owner-gov";
export const BENEFICIAL_OWNER_INDIVIDUAL_PAGE = "beneficial-owner-individual";
export const BENEFICIAL_OWNER_OTHER_PAGE = "beneficial-owner-other";
export const BENEFICIAL_OWNER_TYPE_PAGE = "beneficial-owner-type";
export const CHECK_YOUR_ANSWERS_PAGE = "check-your-answers";
export const ENTITY_PAGE = "entity";
export const LANDING_PAGE = "landing";
export const MANAGING_OFFICER_PAGE = "managing-officer";
export const MANAGING_OFFICER_CORPORATE_PAGE = "managing-officer-corporate";
export const PRESENTER_PAGE = "presenter";

export const ERROR_PAGE = "error-page";
export const NOT_FOUND_PAGE = "page-not-found";
export const SERVICE_OFFLINE_PAGE = "service-offline";

// ROUTING PATHs
export const LANDING_URL = "/register-an-overseas-entity";

export const REGISTER_AN_OVERSEAS_ENTITY_URL = LANDING_URL + "/";
export const BENEFICIAL_OWNER_GOV_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_GOV_PAGE;
export const BENEFICIAL_OWNER_TYPE_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_TYPE_PAGE;
export const BENEFICIAL_OWNER_OTHER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL +  BENEFICIAL_OWNER_OTHER_PAGE;
export const CHECK_YOUR_ANSWERS_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + CHECK_YOUR_ANSWERS_PAGE;
export const ENTITY_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + ENTITY_PAGE;
export const MANAGING_OFFICER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + MANAGING_OFFICER_PAGE;
export const MANAGING_OFFICER_CORPORATE_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + MANAGING_OFFICER_CORPORATE_PAGE;
export const PRESENTER_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + PRESENTER_PAGE;
export const BENEFICIAL_OWNER_INDIVIDUAL_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + BENEFICIAL_OWNER_INDIVIDUAL_PAGE;
