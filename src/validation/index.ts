import { beneficialOwnerGov, updateBeneficialOwnerGov, updateReviewBeneficialOwnerGovValidator } from "./beneficial.owner.gov.validation";
import { beneficialOwnerIndividual, updateBeneficialOwnerIndividual } from "./beneficial.owner.individual.validation";
import { beneficialOwnerOther, updateBeneficialOwnerOther, updateReviewBeneficialOwnerOther } from "./beneficial.owner.other.validation";
import { beneficialOwnersStatement } from "./beneficial.owner.statements.validation";
import { beneficialOwnerDeleteWarning } from "./beneficial.owner.delete.warning.validation";
import { confirmToRemove } from "./confirm.to.remove.validation";
import { beneficialOwnersType, updateBeneficialOwnerAndManagingOfficerType } from "./beneficial.owner.type.validation";
import { soldLandFilter } from "./sold.land.filter.validation";
import { entity } from "./entity.validation";
import { managingOfficerCorporate, reviewManagingOfficerCorporate, updateManagingOfficerCorporate } from "./managing.officer.corporate.validation";
import { managingOfficerIndividual, updateManagingOfficerIndividual, reviewManagingOfficers } from "./managing.officer.validation";
import { presenter } from "./presenter.validation";
import { overseasEntityQuery } from "./overseas.entity.query.validation";
import { secureRegisterFilter } from "./secure.register.filter.validation";
import { trustInformation } from "./trust.information.validation";
import { whoIsMakingFiling, whoIsMakingUpdate } from "./who.is.making.filing.validation";
import { dueDiligence } from "./due.diligence.validation";
import { overseasEntityDueDiligence } from "./overseas.entity.due.diligence.validation";
import { signOut } from "./sign.out.validation";
import { overseasName } from "./overseas.name.validation";
import { startingNew } from "./starting.new.validation";
import { trustInvolved } from './trust.involved.validation';
import { trustDetails, reviewTrustDetails } from "./trust.details.validation";
import { trustIndividualBeneficialOwner } from "./trust.individual.beneficial.owner.validation";
import { trustHistoricalBeneficialOwner } from "./trust.historical.beneficial.owner.validation";
import { updateBeneficialOwnerStatements } from "./update.beneficial.owner.statements.validation";
import { trustLegalEntityBeneficialOwnerValidator } from "./trust.legal.entity.beneficial.owner.validation";
import { registrableBeneficialOwner } from "./registrable.beneficial.owner.validation";
import { updateBeneficialOwnerAndReviewValidator } from "./update.beneficial.owner.indiviual.review.validation";
import { updateContinueSavedFiling } from "./update/update.continue.saved.filing.validation";
import { updateFilingDate } from "./update/update.filing.date.validation";
import { anyTrustsInvolved } from "./update/update.any.trusts.involved.validation";
import { statementResolution } from "./update/review.update.statement.validation";
import { removeSoldAllLandFilter } from "./update/remove.sold.all.land.filter.validation";
import { removeIsEntityRegisteredOwner } from "./update/remove.is.entity.registered.owner.validation";
import { removeConfirmStatement } from "./update/remove.confirm.statement.validation";
import { relevantPeriodOwnedLandFilter } from "./relevant.period.owned.land.validation";
import { relevantPeriodCombinedStatements } from "./relevant.period.combined.statements.validation";
import { relevantPeriodRequiredInformation } from "./relevant.period.required.information.validation";
import { relevantPeriodProvideInfoNowOrLater } from "./relevant.period.provide.information.now.or.later.validation";

export const validator = {
  soldLandFilter,
  secureRegisterFilter,
  entity,
  presenter,
  overseasEntityQuery,
  beneficialOwnersStatement,
  beneficialOwnersType,
  managingOfficerIndividual,
  updateManagingOfficerIndividual,
  managingOfficerCorporate,
  updateManagingOfficerCorporate,
  beneficialOwnerIndividual,
  beneficialOwnerOther,
  beneficialOwnerGov,
  whoIsMakingFiling,
  whoIsMakingUpdate,
  dueDiligence,
  overseasEntityDueDiligence,
  trustInformation,
  beneficialOwnerDeleteWarning,
  confirmToRemove,
  signOut,
  overseasName,
  startingNew,
  trustInvolved,
  trustDetails,
  reviewTrustDetails,
  updateBeneficialOwnerAndManagingOfficerType,
  updateBeneficialOwnerStatements,
  updateBeneficialOwnerIndividual,
  updateBeneficialOwnerGov,
  updateBeneficialOwnerOther,
  updateReviewBeneficialOwnerOther,
  trustIndividualBeneficialOwner,
  trustHistoricalBeneficialOwner,
  trustLegalEntityBeneficialOwnerValidator,
  registrableBeneficialOwner,
  updateBeneficialOwnerAndReviewValidator,
  updateReviewBeneficialOwnerGovValidator,
  reviewManagingOfficers,
  updateContinueSavedFiling,
  updateFilingDate,
  reviewManagingOfficerCorporate,
  anyTrustsInvolved,
  statementResolution,
  removeSoldAllLandFilter,
  removeIsEntityRegisteredOwner,
  removeConfirmStatement,
  relevantPeriodOwnedLandFilter,
  relevantPeriodCombinedStatements,
  relevantPeriodRequiredInformation,
  relevantPeriodProvideInfoNowOrLater
};
