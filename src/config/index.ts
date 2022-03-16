export const getEnvironmentValue = (key: string, defaultValue = ""): string => {
  const value: string = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Please set the environment variable "${key}"`);
  }

  return value;
};

// APP CONFIGs
export const APPLICATION_NAME = "overseas-entities-web";
export const PORT = getEnvironmentValue("PORT", "3000");
export const NODE_ENV = getEnvironmentValue("NODE_ENV");
export const CDN_HOST = getEnvironmentValue("CDN_HOST");

// ROUTING PATH
export const LANDING_URL = "/";

// TEMPLATE PATH
export const LANDING_PAGE = "index";
