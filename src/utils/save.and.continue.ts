import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { updateOverseasEntity } from "../service/overseas.entities.service";

export const saveAndContinue = async (req: Request, session: Session) => {
  await updateOverseasEntity(req, session);
};
