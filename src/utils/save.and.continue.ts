import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { isActiveFeature } from "./feature.flag";
import { FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME } from "../config";
import { updateOverseasEntity } from "../service/overseas.entities.service";

export const saveAndContinue = async(req: Request, session: Session, isRegistration: boolean) => {
  if (isRegistration
    || (!isRegistration && isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME))) {
    await updateOverseasEntity(req, session);
  }
};
