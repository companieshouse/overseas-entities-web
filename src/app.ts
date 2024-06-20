import express from "express";
import cookieParser from 'cookie-parser';
import Redis from 'ioredis';
import * as nunjucks from "nunjucks";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import * as path from "path";
import {
  SessionStore,
  SessionMiddleware,
} from '@companieshouse/node-session-handler';

import * as config from "./config";
import { logger } from "./utils/logger";
import router from "./routes";
import errorHandler from "./controllers/error.controller";
import { createChangeLinkConfig, createSummaryListLink } from "./utils/change.link";
import { countryFilter } from "./utils/country.filter";
import { ErrorMessages } from "./validation/error.messages";

const app = express();

// set some app variables from the environment
app.set("port", config.PORT);
app.set("dev", config.NODE_ENV === "development");

// set up the template engine
const nunjucksEnv = nunjucks.configure([
  "views",
  "views/update",
  "views/update/remove",
  "node_modules/govuk-frontend",
  "node_modules/govuk-frontend/components",
  "node_modules/@companieshouse"
], {
  autoescape: true,
  express: app,
});
nunjucksEnv.addGlobal("CDN_HOST", config.CDN_HOST);
nunjucksEnv.addGlobal("SERVICE_NAME", config.SERVICE_NAME);
nunjucksEnv.addGlobal("UPDATE_SERVICE_NAME", config.UPDATE_SERVICE_NAME);
nunjucksEnv.addGlobal("REMOVE_SERVICE_NAME", config.REMOVE_SERVICE_NAME);
nunjucksEnv.addGlobal("OE_CONFIGS", config);
nunjucksEnv.addGlobal("ERROR_MESSAGES", ErrorMessages);
nunjucksEnv.addGlobal("COUNTRY_FILTER", countryFilter );
nunjucksEnv.addGlobal("CREATE_CHANGE_LINK", createChangeLinkConfig);
nunjucksEnv.addGlobal("SUMMARY_LIST_LINK", createSummaryListLink);
nunjucksEnv.addGlobal("PIWIK_URL", config.PIWIK_URL);
nunjucksEnv.addGlobal("PIWIK_SITE_ID", config.PIWIK_SITE_ID);
nunjucksEnv.addGlobal("PIWIK_START_GOAL_ID", config.PIWIK_START_GOAL_ID);
nunjucksEnv.addGlobal("PIWIK_UPDATE_START_GOAL_ID", config.PIWIK_UPDATE_START_GOAL_ID);
nunjucksEnv.addGlobal("PIWIK_REMOVE_START_GOAL_ID", config.PIWIK_REMOVE_START_GOAL_ID);
nunjucksEnv.addGlobal("MATOMO_ASSET_PATH", `//${config.CDN_HOST}`);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const cookieConfig = {
  cookieName: '__SID',
  cookieSecret: config.COOKIE_SECRET,
  cookieDomain: config.COOKIE_DOMAIN,
  cookieTimeToLiveInSeconds: parseInt(config.DEFAULT_SESSION_EXPIRATION, 10)
};
const sessionStore = new SessionStore(new Redis(`redis://${config.CACHE_SERVER}`));
app.use(SessionMiddleware(cookieConfig, sessionStore));

// TODO This will be enabled to true once Update and Remove journeys are completed

const csrfProtectionMiddleware = CsrfProtectionMiddleware({
  sessionStore,
  enabled: true,
  sessionCookieName: config.COOKIE_NAME
});
app.use(csrfProtectionMiddleware);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// apply our default router to /
app.use("/", router);

app.use(errorHandler);
logger.info("Register an overseas entity has started");
export default app;
