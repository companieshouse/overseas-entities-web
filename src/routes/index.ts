import { Router } from "express";

import * as config from "../config";
import {
  beneficialOwnerGov,
  beneficialOwnerIndividual,
  beneficialOwnerOther,
  beneficialOwnerStatements,
  beneficialOwnerDeleteWarning,
  beneficialOwnerType,
  cannotUse,
  checkYourAnswers,
  confirmation,
  entity,
  healthcheck,
  interruptCard,
  landing,
  updateLanding,
  overseasEntityQuery,
  managingOfficerIndividual,
  managingOfficerCorporate,
  presenter,
  payment,
  soldLandFilter,
  secureRegisterFilter,
  trustInformation,
  usePaper,
  whoIsMakingFiling,
  dueDiligence,
  overseasEntityDueDiligence,
  accessibilityStatement,
  signOut,
  trustDetails,
  resumeSubmission
} from "../controllers";

import { serviceAvailabilityMiddleware } from "../middleware/service.availability.middleware";
import { authentication } from "../middleware/authentication.middleware";
import { navigation } from "../middleware/navigation";
import { checkTrustValidations, checkValidations } from "../middleware/validation.middleware";
import { isFeatureEnabled } from '../middleware/is.feature.enabled.middleware';
import { validator } from "../validation";

const router = Router();

router.use(serviceAvailabilityMiddleware);

router.get(config.HEALTHCHECK_URL, healthcheck.get);
router.get(config.ACCESSIBILITY_STATEMENT_URL, accessibilityStatement.get);

router.get(config.LANDING_URL, landing.get);
router.get(config.UPDATE_LANDING_URL, updateLanding.get);

router.get(config.SIGN_OUT_URL, signOut.get);
router.post(config.SIGN_OUT_URL, ...validator.signOut, checkValidations, signOut.post);

router.get(config.RESUME_SUBMISSION_URL, authentication, resumeSubmission.get);

router.get(config.SOLD_LAND_FILTER_URL, authentication, soldLandFilter.get);
router.post(config.SOLD_LAND_FILTER_URL, authentication, ...validator.soldLandFilter, checkValidations, soldLandFilter.post);

router.get(config.OVERSEAS_ENTITY_QUERY_URL, authentication, overseasEntityQuery.get);
router.post(config.OVERSEAS_ENTITY_QUERY_URL, authentication, ...validator.overseasEntityQuery, checkValidations, overseasEntityQuery.post);

router.get(config.CANNOT_USE_URL, authentication, cannotUse.get);

router.get(config.SECURE_REGISTER_FILTER_URL, authentication, navigation.hasSoldLand, secureRegisterFilter.get);
router.post(config.SECURE_REGISTER_FILTER_URL, authentication, navigation.hasSoldLand, ...validator.secureRegisterFilter, checkValidations, secureRegisterFilter.post);

router.get(config.USE_PAPER_URL, authentication, navigation.hasSoldLand, usePaper.get);

router.get(config.INTERRUPT_CARD_URL, authentication, navigation.isSecureRegister, interruptCard.get);

router.get(config.PRESENTER_URL, authentication, navigation.isSecureRegister, presenter.get);
router.post(config.PRESENTER_URL, authentication, navigation.isSecureRegister, ...validator.presenter, checkValidations, presenter.post);

router.get(config.WHO_IS_MAKING_FILING_URL, authentication, navigation.hasPresenter, whoIsMakingFiling.get);
router.post(config.WHO_IS_MAKING_FILING_URL, authentication, navigation.hasPresenter, ...validator.whoIsMakingFiling, checkValidations, whoIsMakingFiling.post);

router.get(config.DUE_DILIGENCE_URL, authentication, navigation.hasPresenter, dueDiligence.get);
router.post(config.DUE_DILIGENCE_URL, authentication, navigation.hasPresenter, ...validator.dueDiligence, checkValidations, dueDiligence.post);

router.get(config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL, authentication, navigation.hasPresenter, overseasEntityDueDiligence.get);
router.post(config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL, authentication, navigation.hasPresenter, ...validator.overseasEntityDueDiligence, checkValidations, overseasEntityDueDiligence.post);

router.get(config.ENTITY_URL, authentication, navigation.hasDueDiligence, entity.get);
router.post(config.ENTITY_URL, authentication, navigation.hasDueDiligence, ...validator.entity, checkValidations, entity.post);

router.get(config.BENEFICIAL_OWNER_STATEMENTS_URL, authentication, navigation.hasEntity, beneficialOwnerStatements.get);
router.post(config.BENEFICIAL_OWNER_STATEMENTS_URL, authentication, navigation.hasEntity, ...validator.beneficialOwnersStatement, checkValidations, beneficialOwnerStatements.post);

router.get(config.BENEFICIAL_OWNER_DELETE_WARNING_URL, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerDeleteWarning.get);
router.post(config.BENEFICIAL_OWNER_DELETE_WARNING_URL, authentication, navigation.hasBeneficialOwnersStatement, ...validator.beneficialOwnerDeleteWarning, checkValidations, beneficialOwnerDeleteWarning.post);

router.get(config.BENEFICIAL_OWNER_TYPE_URL, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerType.get);
router.post(config.BENEFICIAL_OWNER_TYPE_URL, authentication, navigation.hasBeneficialOwnersStatement, ...validator.beneficialOwnersType, checkValidations, beneficialOwnerType.post);

router.get(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerIndividual.get);
router.get(config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerIndividual.getById);
router.post(config.BENEFICIAL_OWNER_INDIVIDUAL_URL, authentication, navigation.hasBeneficialOwnersStatement, ...validator.beneficialOwnerIndividual, checkValidations, beneficialOwnerIndividual.post);
router.post(config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, ...validator.beneficialOwnerIndividual, checkValidations, beneficialOwnerIndividual.update);
router.get(config.BENEFICIAL_OWNER_INDIVIDUAL_URL + config.REMOVE + config.ID, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerIndividual.remove);

router.get(config.BENEFICIAL_OWNER_OTHER_URL, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerOther.get);
router.get(config.BENEFICIAL_OWNER_OTHER_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerOther.getById);
router.post(config.BENEFICIAL_OWNER_OTHER_URL, authentication, navigation.hasBeneficialOwnersStatement, ...validator.beneficialOwnerOther, checkValidations, beneficialOwnerOther.post);
router.post(config.BENEFICIAL_OWNER_OTHER_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, ...validator.beneficialOwnerOther, checkValidations, beneficialOwnerOther.update);
router.get(config.BENEFICIAL_OWNER_OTHER_URL + config.REMOVE + config.ID, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerOther.remove);

router.get(config.BENEFICIAL_OWNER_GOV_URL, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerGov.get);
router.get(config.BENEFICIAL_OWNER_GOV_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerGov.getById);
router.post(config.BENEFICIAL_OWNER_GOV_URL, authentication, navigation.hasBeneficialOwnersStatement, ...validator.beneficialOwnerGov, checkValidations, beneficialOwnerGov.post);
router.post(config.BENEFICIAL_OWNER_GOV_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, ...validator.beneficialOwnerGov, checkValidations, beneficialOwnerGov.update);
router.get(config.BENEFICIAL_OWNER_GOV_URL + config.REMOVE + config.ID, authentication, navigation.hasBeneficialOwnersStatement, beneficialOwnerGov.remove);

router.get(config.MANAGING_OFFICER_URL, authentication, navigation.hasBeneficialOwnersStatement, managingOfficerIndividual.get);
router.get(config.MANAGING_OFFICER_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, managingOfficerIndividual.getById);
router.post(config.MANAGING_OFFICER_URL, authentication, navigation.hasBeneficialOwnersStatement, ...validator.managingOfficerIndividual, checkValidations, managingOfficerIndividual.post);
router.post(config.MANAGING_OFFICER_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, ...validator.managingOfficerIndividual, checkValidations, managingOfficerIndividual.update);
router.get(config.MANAGING_OFFICER_URL + config.REMOVE + config.ID, authentication, navigation.hasBeneficialOwnersStatement, managingOfficerIndividual.remove);

router.get(config.MANAGING_OFFICER_CORPORATE_URL, authentication, navigation.hasBeneficialOwnersStatement, managingOfficerCorporate.get);
router.get(config.MANAGING_OFFICER_CORPORATE_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, managingOfficerCorporate.getById);
router.post(config.MANAGING_OFFICER_CORPORATE_URL, authentication, navigation.hasBeneficialOwnersStatement, ...validator.managingOfficerCorporate, checkValidations, managingOfficerCorporate.post);
router.post(config.MANAGING_OFFICER_CORPORATE_URL + config.ID, authentication, navigation.hasBeneficialOwnersStatement, ...validator.managingOfficerCorporate, checkValidations, managingOfficerCorporate.update);
router.get(config.MANAGING_OFFICER_CORPORATE_URL + config.REMOVE + config.ID, authentication, navigation.hasBeneficialOwnersStatement, managingOfficerCorporate.remove);

// TO DO: add a navigation middleware that has got only BOs with the right NOC selected
router.get(config.TRUST_INFO_URL, authentication, navigation.hasBOsOrMOs, trustInformation.get);
router.post(config.TRUST_INFO_URL, authentication, navigation.hasBOsOrMOs, ...validator.trustInformation, checkTrustValidations, trustInformation.post);

router
  .route(config.TRUST_DETAILS_URL + config.ID + '?')
  .all(
    isFeatureEnabled(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB),
    authentication,
  )
  .get(trustDetails.get)
  .post(trustDetails.post);

router.get(config.CHECK_YOUR_ANSWERS_URL, authentication, navigation.hasBOsOrMOs, checkYourAnswers.get);
router.post(config.CHECK_YOUR_ANSWERS_URL, authentication, navigation.hasBOsOrMOs, checkYourAnswers.post);

router.get(config.PAYMENT_WITH_TRANSACTION_URL, authentication, payment.get);

router.get(config.CONFIRMATION_URL, authentication, navigation.hasBOsOrMOs, confirmation.get);

export default router;
