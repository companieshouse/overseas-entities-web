import { Router } from "express";
import { get } from "../controllers/index.controller";

import * as config from "../config";

const router = Router();

router.get(config.LANDING_URL, get);

export default router;
