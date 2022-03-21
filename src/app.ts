import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import * as config from "./config";
import { logger } from "./utils/logger";
import router from "./routes";
import errorHandler from "./controllers/error.controller";

const app = express();

// set some app variables from the environment
app.set("port", config.PORT);
app.set("dev", config.NODE_ENV === "development");

// set up the template engine
const nunjucksEnv = nunjucks.configure([
  "views",
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components",
], {
  autoescape: true,
  express: app,
});
nunjucksEnv.addGlobal("CDN_HOST", config.CDN_HOST);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// apply our default router to /
app.use("/", router);
app.use(errorHandler);

logger.info("Register an overseas entity has started");
export default app;
