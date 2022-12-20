import { beneficialOwnerGov } from "./beneficial.owner.gov.validation";
import { beneficialOwnerIndividual } from "./beneficial.owner.individual.validation";
import { beneficialOwnerOther } from "./beneficial.owner.other.validation";
import { beneficialOwnersStatement } from "./beneficial.owner.statements.validation";
import { beneficialOwnerDeleteWarning } from "./beneficial.owner.delete.warning.validation";
import { beneficialOwnersType } from "./beneficial.owner.type.validation";
import { soldLandFilter } from "./sold.land.filter.validation";
import { entity } from "./entity.validation";
import { managingOfficerCorporate } from "./managing.officer.corporate.validation";
import { managingOfficerIndividual } from "./managing.officer.validation";
import { presenter } from "./presenter.validation";
import { overseasEntityQuery } from "./overseas.entity.query.validation";
import { secureRegisterFilter } from "./secure.register.filter.validation";
import { trustInformation } from "./trust.information.validation";
import { whoIsMakingFiling } from "./who.is.making.filing.validation";
import { dueDiligence } from "./due.diligence.validation";
import { overseasEntityDueDiligence } from "./overseas.entity.due.diligence.validation";
import { signOut } from "./sign.out.validation";

export const validator = {
  soldLandFilter,
  secureRegisterFilter,
  entity,
  presenter,
  overseasEntityQuery,
  beneficialOwnersStatement,
  beneficialOwnersType,
  managingOfficerIndividual,
  managingOfficerCorporate,
  beneficialOwnerIndividual,
  beneficialOwnerOther,
  beneficialOwnerGov,
  whoIsMakingFiling,
  dueDiligence,
  overseasEntityDueDiligence,
  trustInformation,
  beneficialOwnerDeleteWarning,
  signOut
};
