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
  healthcheck,
  interruptCard,
  landing,
  managingOfficerIndividual,
  managingOfficerCorporate,
  presenter,
  payment
} from "../controllers";

import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";
import { authentication } from "../middleware/authentication.middleware";
import errorHandler from "../controllers/error.controller";

import { checkValidations } from "../middleware/validation.middleware";
import { validator } from "../validation";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.HEALTHCHECK_URL, healthcheck.get);

router.get(config.LANDING_URL, landing.get);

router.get(config.INTERRUPT_CARD_URL, interruptCard.get);

router.get(config.PRESENTER_URL, authentication, presenter.get);
router.post(config.PRESENTER_URL, authentication, ...validator.presenter, checkValidations, presenter.post);

router.get(config.ENTITY_URL, authentication, entity.get);
router.post(config.ENTITY_URL, authentication, ...validator.entity, checkValidations, entity.post);

router.get(config.BENEFICIAL_OWNER_STATEMENTS_URL, authentication, beneficialOwnerStatements.get);
router.post(config.BENEFICIAL_OWNER_STATEMENTS_URL, authentication, ...validator.beneficialOwnersStatement, checkValidations, beneficialOwnerStatements.post);

router.get(config.BENEFICIAL_OWNER_TYPE_URL, authentication, beneficialOwnerType.get);
router.post(config.BENEFICIAL_OWNER_TYPE_URL, authentication, ...validator.beneficialOwnersType, checkValidations, beneficialOwnerType.post);

router.get(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, beneficialOwnerIndividual.get);
router.post(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, ...validator.beneficialOwnerIndividual, checkValidations, beneficialOwnerIndividual.post);

router.get(config.BENEFICIAL_OWNER_OTHER_URL, authentication, beneficialOwnerOther.get);
router.post(config.BENEFICIAL_OWNER_OTHER_URL, authentication, ...validator.beneficialOwnerOther, checkValidations, beneficialOwnerOther.post);

router.get(config.BENEFICIAL_OWNER_GOV_URL, authentication, beneficialOwnerGov.get);
router.post(config.BENEFICIAL_OWNER_GOV_URL, authentication, ...validator.beneficialOwnerGov, checkValidations, beneficialOwnerGov.post);

router.get(config.MANAGING_OFFICER_URL, authentication, managingOfficerIndividual.get);
router.post(config.MANAGING_OFFICER_URL, authentication, ...validator.managingOfficerIndividual, checkValidations, managingOfficerIndividual.post);

router.get(config.MANAGING_OFFICER_CORPORATE_URL, authentication, managingOfficerCorporate.get);
router.post(config.MANAGING_OFFICER_CORPORATE_URL, authentication, ...validator.managingOfficerCorporate, checkValidations, managingOfficerCorporate.post);

router.get(config.CHECK_YOUR_ANSWERS_URL, authentication, checkYourAnswers.get);
router.post(config.CHECK_YOUR_ANSWERS_URL, authentication, checkYourAnswers.post);

router.get(config.PAYMENT_WITH_TRANSACTION_URL, authentication, payment.get);

router.get(config.CONFIRMATION_URL, authentication, confirmation.get);

router.use(errorHandler);

export default router;
