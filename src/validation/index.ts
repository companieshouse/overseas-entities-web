import { beneficialOwnerGov, updateBeneficialOwnerGov, updateReviewBeneficialOwnerGovValidator } from "./beneficial.owner.gov.validation";
import { beneficialOwnerIndividual, updateBeneficialOwnerIndividual } from "./beneficial.owner.individual.validation";
import { beneficialOwnerOther, updateBeneficialOwnerOther } from "./beneficial.owner.other.validation";
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
import { beneficialOwnersTypeSubmission } from "./beneficial.owner.type.validation.submission";
import { trustDetails, reviewTrustDetails } from "./trust.details.validation";
import { trustIndividualBeneficialOwner } from "./trust.individual.beneficial.owner.validation";
import { trustHistoricalBeneficialOwner } from "./trust.historical.beneficial.owner.validation";
import { addTrustValidations } from "./add.trust.validation";
import { updateBeneficialOwnerStatements } from "./update.beneficial.owner.statements.validation";
import { trustLegalEntityBeneficialOwnerValidator } from "./trust.legal.entity.beneficial.owner.validation";
import { registrableBeneficialOwner } from "./registrable.beneficial.owner.validation";
import { updateBeneficialOwnerAndReviewValidator } from "./update.beneficial.owner.indiviual.review.validation";
import { updateContinueSavedFiling } from "./update/update.continue.saved.filing.validation";
import { updateFilingDate } from "./update/update.filing.date.validation";
import { anyTrustsInvolved } from "./update/update.any.trusts.involved.validation";
import { doYouWantToMakeOeChange } from "./update/do.you.want.to.make.oe.change.validation";
import { reviewUpdateStatementChange, statementResolution } from "./update/review.update.statement.validation";

export const validator = {
  soldLandFilter,
  secureRegisterFilter,
  doYouWantToMakeOeChange,
  entity,
  presenter,
  overseasEntityQuery,
  beneficialOwnersStatement,
  beneficialOwnersType,
  beneficialOwnersTypeSubmission,
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
  trustIndividualBeneficialOwner,
  trustHistoricalBeneficialOwner,
  addTrust: addTrustValidations,
  trustLegalEntityBeneficialOwnerValidator,
  registrableBeneficialOwner,
  updateBeneficialOwnerAndReviewValidator,
  updateReviewBeneficialOwnerGovValidator,
  reviewManagingOfficers,
  updateContinueSavedFiling,
  updateFilingDate,
  reviewManagingOfficerCorporate,
  anyTrustsInvolved,
  reviewUpdateStatementChange,
  statementResolution,
};
