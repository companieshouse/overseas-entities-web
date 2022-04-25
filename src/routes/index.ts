import { Router } from "express";

import * as config from "../config";
import {
  authentication,
  beneficialOwnerGov,
  beneficialOwnerIndividual,
  beneficialOwnerOther,
  beneficialOwnerStatements,
  beneficialOwnerType,
  checkYourAnswers,
  confirmation,
  entity,
  landing,
  managingOfficer,
  managingOfficerCorporate,
  presenter
} from "../controllers";

import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";
import errorHandler from "../controllers/error.controller";
import { checkValidations } from "../middleware/validation.middleware";
import { entityValidator } from "../validation/entity.validation";
import { boIndividualValidator } from "../validation/beneficial.owner.individual.validation";
import { moIndividualValidator } from "../validation/managing.officer.validation";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.LANDING_URL, landing.get);

router.get(config.PRESENTER_URL, authentication, presenter.get);
router.post(config.PRESENTER_URL, authentication, presenter.post);

router.get(config.ENTITY_URL, authentication, entity.get);
router.post(config.ENTITY_URL, authentication, ...entityValidator, checkValidations, entity.post);

router.get(config.BENEFICIAL_OWNER_STATEMENTS_URL, authentication, beneficialOwnerStatements.get);
router.post(config.BENEFICIAL_OWNER_STATEMENTS_URL, authentication, beneficialOwnerStatements.post);

router.get(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.get);
router.post(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.post);

router.get(config.BENEFICIAL_OWNER_OTHER_URL, authentication, beneficialOwnerOther.get);
router.post(config.BENEFICIAL_OWNER_OTHER_URL, authentication, beneficialOwnerOther.post);

router.get(config.MANAGING_OFFICER_URL, authentication, managingOfficer.get);
router.post(config.MANAGING_OFFICER_URL, authentication, ...moIndividualValidator, checkValidations, managingOfficer.post);

router.get(config.MANAGING_OFFICER_CORPORATE_URL, authentication, managingOfficerCorporate.get);
router.post(config.MANAGING_OFFICER_CORPORATE_URL, authentication, managingOfficerCorporate.post);

router.get(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, beneficialOwnerIndividual.get);
router.post(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, ...boIndividualValidator, checkValidations, beneficialOwnerIndividual.post);

router.get(config.BENEFICIAL_OWNER_GOV_URL, authentication, beneficialOwnerGov.get);
router.post(config.BENEFICIAL_OWNER_GOV_URL, authentication, beneficialOwnerGov.post);

router.get(config.CHECK_YOUR_ANSWERS_URL, authentication, checkYourAnswers.get);
router.post(config.CHECK_YOUR_ANSWERS_URL, authentication, checkYourAnswers.post);

router.get(config.CONFIRMATION_URL, authentication, confirmation.get);

router.use(errorHandler);

export default router;
