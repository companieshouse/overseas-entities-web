import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { ApplicationData } from "../model";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { logger } from "../utils/logger";

export const getCompanyProfile = async (
  req: Request,
  oeNumber: string,
): Promise<ApplicationData> => {
  const response = await makeApiCallWithRetry(
    "companyProfile",
    "getCompanyProfile",
    req,
    req.session as Session,
    oeNumber,
  );
  const infoMsg = `OE NUMBER ID: ${oeNumber}`;
  logger.debugRequest(req, `Overseas Entity Retrieved - ${infoMsg}`);
  return response.resource;
};