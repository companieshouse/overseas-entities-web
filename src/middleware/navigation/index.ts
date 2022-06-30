import { hasBOsOrMOs } from "./has.beneficial.owners.or.managing.officers.middleware";
import { hasBeneficialOwnersStatement } from "./has.beneficial.owners.statement.middleware";
import { hasEntity } from "./has.entity.middleware";
import { hasPresenter } from "./has.presenter.middleware";
import { hasSoldLand } from "./has.sold.land.middleware";
import { isSecureRegister } from "./is.secure.register.middleware";

export const navigation = {
  hasSoldLand,
  isSecureRegister,
  hasPresenter,
  hasEntity,
  hasBeneficialOwnersStatement,
  hasBOsOrMOs
};
