import { beneficialOwnersStatement } from "./beneficial.owner.statements.validation";
import { beneficialOwnersType } from "./beneficial.owner.type.validation";
import { entity } from "./entity.validation";
import { presenter } from "./presenter.validation";

export const validator = {
  entity,
  presenter,
  beneficialOwnersStatement,
  beneficialOwnersType
};
