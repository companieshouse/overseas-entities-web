import { Router } from "express";

import * as config from "../config";
import {
  authentication,
  landing,
  presenter,
  entity
} from "../controllers";

import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";
import errorHandler from "../controllers/error.controller";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.LANDING_URL, landing.get);

router.get(config.PRESENTER_URL, authentication, presenter.get);
router.post(config.PRESENTER_URL, authentication, presenter.post);

router.get(config.ENTITY_URL, authentication, entity.get);
router.post(config.ENTITY_URL, authentication, entity.post);

router.get(config.BENEFICIAL_OWNER_TYPE_URL, authentication, presenter.get);

router.use(errorHandler);

export default router;
