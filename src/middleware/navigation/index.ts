import { hasBOsOrMOs } from "./has.beneficial.owners.or.managing.officers.middleware";
import { hasBeneficialOwnersStatement } from "./has.beneficial.owners.statement.middleware";
import { hasDueDiligence } from "./has.due.diligence.middleware";
import { hasEntity } from "./has.entity.middleware";
import { hasPresenter } from "./has.presenter.middleware";
import { hasSoldLand } from "./has.sold.land.middleware";
import { isSecureRegister } from "./is.secure.register.middleware";
import { hasOverseasName } from "./has.overseas.name.middleware";
import { hasTrustWithId, hasTrustData } from "./has.trust.middleware";

// UPDATE journey
import { hasOverseasEntityNumber, hasOverseasEntity } from "./update/has.overseas.entity.middleware";
import { hasUpdatePresenter } from "./update/has.presenter.middleware";
import { hasWhoIsMakingUpdate } from "./update/has.who.is.making.update.middleware";
import { hasEntityUpdateDetails } from "./update/has.entity.update.middleware";

export const navigation = {
  hasSoldLand,
  isSecureRegister,
  hasPresenter,
  hasDueDiligence,
  hasEntity,
  hasBeneficialOwnersStatement,
  hasBOsOrMOs,
  hasOverseasName,
  hasTrustWithId,
  hasTrustData,
  hasOverseasEntityNumber,
  hasOverseasEntity,
  hasUpdatePresenter,
  hasWhoIsMakingUpdate,
  hasEntityUpdateDetails
};
