import { Router } from "express";

import * as config from "../config";
import {
  authentication,
  landing,
  presenter,
  corporate
} from "../controllers";

import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";
import errorHandler from "../controllers/error.controller";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.LANDING_URL, landing.get);
router.get(config.PRESENTER_URL, authentication, presenter.get);
router.get(config.BENEFIFICAL_OWNER_CORPORATE_URL, corporate.get);

router.use(errorHandler);

export default router;
