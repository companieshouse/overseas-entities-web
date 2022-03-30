import { Router } from "express";

import * as config from "../config";
import {
  authentication,
  beneficialOwnerOther,
  beneficialOwnerType,
  entity,
  landing,
  managingOfficer,
  managingOfficerCorporate,
  presenter,
  beneficialOwnerIndividual
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

router.get(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.get);
router.post(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.post);

router.get(config.BENEFICIAL_OWNER_OTHER_URL, authentication, beneficialOwnerOther.get);
router.post(config.BENEFICIAL_OWNER_OTHER_URL, authentication, beneficialOwnerOther.post);

router.get(config.MANAGING_OFFICER_URL, authentication, managingOfficer.get);

router.get(config.MANAGING_OFFICER_CORPORATE_URL, authentication, managingOfficerCorporate.get);

router.get(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, beneficialOwnerIndividual.get);

router.use(errorHandler);

export default router;
