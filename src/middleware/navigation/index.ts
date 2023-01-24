import { hasBOsOrMOs } from "./has.beneficial.owners.or.managing.officers.middleware";
import { hasBeneficialOwnersStatement } from "./has.beneficial.owners.statement.middleware";
import { hasDueDiligence } from "./has.due.diligence.middleware";
import { hasEntity } from "./has.entity.middleware";
import { hasPresenter } from "./has.presenter.middleware";
import { hasSoldLand } from "./has.sold.land.middleware";
import { isSecureRegister } from "./is.secure.register.middleware";
import { hasOverseasName } from "./has.overseas.name.middleware";
import { hasTrust } from "./has.trust.middleware";
import { hasOverseasEntityNumber } from "./has.overseas.entity.middleware";

export const navigation = {
  hasSoldLand,
  isSecureRegister,
  hasPresenter,
  hasDueDiligence,
  hasEntity,
  hasBeneficialOwnersStatement,
  hasBOsOrMOs,
  hasOverseasName,
  hasTrust,
  hasOverseasEntityNumber
};
