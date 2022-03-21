import { Router } from "express";
import { get } from "../controllers/index.controller";

import * as config from "../config";
import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.LANDING_URL, get);

export default router;
