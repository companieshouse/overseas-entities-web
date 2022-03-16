import { Router } from "express";
import { startController } from "../controllers/index.controller";

import * as config from "../config";

const router = Router();

router.get(config.LANDING_URL, startController);

export default router;
