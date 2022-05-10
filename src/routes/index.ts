import { Router } from "express";

import * as config from "../config";
import {
  beneficialOwnerGov,
  beneficialOwnerIndividual,
  beneficialOwnerOther,
  beneficialOwnerStatements,
  beneficialOwnerType,
  checkYourAnswers,
  confirmation,
  entity,
  landing,
  managingOfficerIndividual,
  managingOfficerCorporate,
  presenter
} from "../controllers";

import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";
import { authentication } from "../middleware/authentication.middleware";
import errorHandler from "../controllers/error.controller";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.LANDING_URL, landing.get);

router.get(config.PRESENTER_URL, authentication, presenter.get);
router.post(config.PRESENTER_URL, authentication, presenter.post);

router.get(config.ENTITY_URL, authentication, entity.get);
router.post(config.ENTITY_URL, authentication, entity.post);

router.get(config.BENEFICIAL_OWNER_STATEMENTS_URL, authentication, beneficialOwnerStatements.get);
router.post(config.BENEFICIAL_OWNER_STATEMENTS_URL, authentication, beneficialOwnerStatements.post);

router.get(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.get);
router.post(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.post);

router.get(config.BENEFICIAL_OWNER_OTHER_URL, authentication, beneficialOwnerOther.get);
router.post(config.BENEFICIAL_OWNER_OTHER_URL, authentication, beneficialOwnerOther.post);

router.get(config.MANAGING_OFFICER_URL, authentication, managingOfficerIndividual.get);
router.post(config.MANAGING_OFFICER_URL, authentication, managingOfficerIndividual.post);

router.get(config.MANAGING_OFFICER_CORPORATE_URL, authentication, managingOfficerCorporate.get);
router.post(config.MANAGING_OFFICER_CORPORATE_URL, authentication, managingOfficerCorporate.post);

router.get(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, beneficialOwnerIndividual.get);
router.post(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, beneficialOwnerIndividual.post);

router.get(config.BENEFICIAL_OWNER_GOV_URL, authentication, beneficialOwnerGov.get);
router.post(config.BENEFICIAL_OWNER_GOV_URL, authentication, beneficialOwnerGov.post);

router.get(config.CHECK_YOUR_ANSWERS_URL, authentication, checkYourAnswers.get);
router.post(config.CHECK_YOUR_ANSWERS_URL, authentication, checkYourAnswers.post);

router.get(config.CONFIRMATION_URL, authentication, confirmation.get);

router.use(errorHandler);

export default router;
