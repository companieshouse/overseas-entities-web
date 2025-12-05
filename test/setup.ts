export default () => {
  process.env.NODE_ENV = "development";
  process.env.CDN_HOST = "CDN_HOST";
  process.env.COOKIE_SECRET = "123456789123456789123456789";
  process.env.COOKIE_DOMAIN = "test";
  process.env.COOKIE_NAME = "test";
  process.env.PAYMENTS_API_URL = "http://chs.local";
  process.env.CACHE_SERVER = "test";
  process.env.API_URL = "test";
  process.env.CHS_API_KEY = "test";
  process.env.CHS_URL = "test";
  process.env.PIWIK_URL = "test";
  process.env.PIWIK_SITE_ID = "test";
  process.env.PIWIK_START_GOAL_ID = "test";
  process.env.PIWIK_UPDATE_START_GOAL_ID = "test";
  process.env.PIWIK_REMOVE_START_GOAL_ID = "test";
  process.env.PIWIK_RELEVANT_PERIOD_START_GOAL_ID = "test";
  process.env.PIWIK_CHS_DOMAIN = "*.chs.local";
  process.env.OE01_PAYMENT_FEE = "234.00";
  process.env.OE02_UPDATE_PAYMENT_FEE = "234.00";
  process.env.LANDING_PAGE_URL = "/register-an-overseas-entity/sold-land-filter?start=0";
  process.env.LANDING_PAGE_STARTING_NEW_URL = "/register-an-overseas-entity/starting-new";
  process.env.UPDATE_LANDING_PAGE_URL = "/update-an-overseas-entity/overseas-entity-query";
  process.env.REMOVE_LANDING_PAGE_URL = "/gov-uk-remove-guidance-page";
  process.env.OAUTH2_CLIENT_ID = "clientId";
  process.env.OAUTH2_CLIENT_SECRET = "123";
  process.env.ACCOUNT_URL = "account.ch";
  process.env.VF01_FORM_DOWNLOAD_URL = "http://www.gov.uk/dummy_vf01";

  //  feature flags
  process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
};