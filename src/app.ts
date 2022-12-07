import express from "express";
import * as config from "./config";
import router from "./routes";
import { logger } from "./utils/logger";
import errorHandler from "./controllers/error.controller";
import configureViews from './service/configureViews';
import configureSession from './service/configureSession';

const app = express();

// set some app variables from the environment
app.set("port", config.PORT);
app.set("dev", config.NODE_ENV === "development");

configureViews(app);
configureSession(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// apply our default router to /
app.use("/", router);

app.use(errorHandler);

logger.info("Register an overseas entity has started");
export default app;
