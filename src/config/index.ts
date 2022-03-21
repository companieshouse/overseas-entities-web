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

// ROUTING PATH
export const REGISTER_AN_OVERSEAS_ENTITY_URL = "/register-an-overseas-entity";
export const LANDING_URL = REGISTER_AN_OVERSEAS_ENTITY_URL;
export const SHOW_SERVICE_OFFLINE_PAGE = getEnvironmentValue("SHOW_SERVICE_OFFLINE_PAGE");

// TEMPLATE PATH
export const LANDING_PAGE = "index";
export const SERVICE_OFFLINE_PAGE = "service-offline";
