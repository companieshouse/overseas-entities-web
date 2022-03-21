import { Router } from "express";

import * as config from "../config";
import {
  authentication,
  landing,
  presenter
} from "../controllers";

import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.LANDING_URL, landing.get);
router.get(config.PRESENTER_URL, authentication, presenter.get);

export default router;
