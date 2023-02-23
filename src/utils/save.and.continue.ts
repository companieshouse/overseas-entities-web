import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { isActiveFeature } from "./feature.flag";
import { FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 } from "../config";
import { updateOverseasEntity } from "../service/overseas.entities.service";

export const saveAndContinue = async (req: Request, session: Session, isUpdatePath: boolean = false) => {
  if (isActiveFeature(FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022) && !isUpdatePath) {
    await updateOverseasEntity(req, session);
  }
};
