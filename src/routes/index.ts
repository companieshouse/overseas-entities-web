import { Router } from "express";

import * as config from "../config";
import {
  authentication,
  beneficialOwnerType,
  landing,
  presenter,
  corporate,
  managingOfficer
} from "../controllers";

import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";
import errorHandler from "../controllers/error.controller";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.LANDING_URL, landing.get);
router.get(config.PRESENTER_URL, authentication, presenter.get);
router.get(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.get);
router.post(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.post);
router.get(config.BENEFICIAL_OWNER_CORPORATE_URL, authentication, corporate.get);
router.get(config.MANAGING_OFFICER_URL, authentication, managingOfficer.get);

router.use(errorHandler);

export default router;
