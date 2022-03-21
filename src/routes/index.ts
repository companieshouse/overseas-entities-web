import { Router } from "express";

import * as config from "../config";
import {
  authentication,
  landing,
  presenter
} from "../controllers";

const router = Router();

router.get(config.LANDING_URL, landing.get);
router.get(config.PRESENTER_URL, authentication, presenter.get);

export default router;
