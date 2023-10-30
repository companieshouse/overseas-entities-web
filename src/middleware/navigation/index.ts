import { hasBOsOrMOs } from "./has.beneficial.owners.or.managing.officers.middleware";
import { hasBeneficialOwnersStatement } from "./has.beneficial.owners.statement.middleware";
import { hasDueDiligence } from "./has.due.diligence.middleware";
import { hasEntity } from "./has.entity.middleware";
import { hasPresenter } from "./has.presenter.middleware";
import { hasSoldLand } from "./has.sold.land.middleware";
import { isSecureRegister } from "./is.secure.register.middleware";
import { hasOverseasName } from "./has.overseas.name.middleware";
import { hasTrustWithIdRegister, hasTrustDataRegister, hasTrustWithIdUpdate, hasTrustDataUpdate, hasTrusteeWithIdUpdate } from "./has.trust.middleware";

// UPDATE journey
import { hasOverseasEntityNumber, hasOverseasEntity } from "./update/has.overseas.entity.middleware";
import { hasUpdatePresenter } from "./update/has.presenter.middleware";
import { hasWhoIsMakingUpdate } from "./update/has.who.is.making.update.middleware";
import { hasEntityUpdateDetails } from "./update/has.entity.update.middleware";
import { hasBOsOrMOsUpdate } from "./update/has.beneficial.owners.or.managing.officers.update.middleware";
import { hasDueDiligenceDetails } from "./update/has.due.diligence.details.middleware";
import { hasGivenValidBoMoDetails } from "./update/has.given.valid.bo.mo.details.middleware";
import { hasAnyBosWithTrusteeNocs } from './update/has.any.bos.with.trustee.nocs.middleware';
import { isInChangeJourney } from './update/is.in.change.journey.middleware';
import {
  reviewTheTrustGuard,
  manageTrustsReviewFormerBOsGuard,
  manageTrustsReviewIndividualsGuard,
  manageTrustsReviewLegalEntitiesGuard,
  manageTrustsTellUsAboutFormerBOsGuard,
  manageTrustsTellUsAboutIndividualsGuard,
  manageTrustsTellUsAboutLegalEntitiesGuard,
} from './update/manage.trusts.middleware';

export const navigation = {
  hasSoldLand,
  isSecureRegister,
  hasPresenter,
  hasDueDiligence,
  hasEntity,
  hasBeneficialOwnersStatement,
  hasBOsOrMOs,
  hasOverseasName,
  hasTrustWithIdRegister,
  hasTrustDataRegister,
  hasTrustWithIdUpdate,
  hasTrusteeWithIdUpdate,
  hasTrustDataUpdate,
  hasOverseasEntityNumber,
  hasOverseasEntity,
  hasUpdatePresenter,
  hasWhoIsMakingUpdate,
  hasEntityUpdateDetails,
  hasBOsOrMOsUpdate,
  hasDueDiligenceDetails,
  hasGivenValidBoMoDetails,
  hasAnyBosWithTrusteeNocs,
  isInChangeJourney,
  reviewTheTrustGuard,
  manageTrustsReviewFormerBOsGuard,
  manageTrustsReviewIndividualsGuard,
  manageTrustsReviewLegalEntitiesGuard,
  manageTrustsTellUsAboutFormerBOsGuard,
  manageTrustsTellUsAboutIndividualsGuard,
  manageTrustsTellUsAboutLegalEntitiesGuard,
};
