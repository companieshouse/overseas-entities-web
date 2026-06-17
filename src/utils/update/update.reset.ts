import * as config from "../../config";
import { Update } from "../../model/update.type.model";
import { ApplicationData } from "../../model/application.model";
import { isActiveFeature } from "../feature.flag";

export const resetEntityUpdate = (appData: ApplicationData): Update => {
  // Entity data will be filled in by caller so not reset.
  appData.update = {};
  appData.presenter = {};
  appData.who_is_registering = undefined;
  appData.due_diligence = {};
  appData.overseas_entity_due_diligence = {};
  appData.payment = undefined;

  // Any other entity dependent models need to be reset here too.
  // Not yet covered by update but let's reset:
  appData.trusts = undefined;
  appData.beneficial_owners_statement = undefined;
  appData.beneficial_owners_individual = undefined;
  appData.beneficial_owners_corporate = undefined;
  appData.beneficial_owners_government_or_public_authority = undefined;
  appData.managing_officers_individual = undefined;
  appData.managing_officers_corporate = undefined;

  // Don't reset is_secure_register as pre-entity.
  // Don't reset has_sold_land as registration only.

  // Save and resume will address overseas_entity_id, transaction_id but reset for now:
  if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    appData.overseas_entity_id = undefined;
    appData.transaction_id = undefined;
  }

  return appData.update;

};
