import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { logger } from "../utils/logger";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const getCompanyProfile = async (
  req: Request,
  oeNumber: string,
): Promise<CompanyProfile> => {
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
