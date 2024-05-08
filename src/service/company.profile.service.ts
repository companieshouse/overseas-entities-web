import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const getCompanyProfile = async (
  req: Request,
  oeNumber: string,
): Promise<CompanyProfile| undefined> => {
  const response = await makeApiCallWithRetry(
    "companyProfile",
    "getCompanyProfile",
    req,
    req.session as Session,
    oeNumber,
  );

  if (response.httpStatusCode !== 200 && response.httpStatusCode !== 404) {
    const errorMsg = `Something went wrong fetching company profile = ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No company profile data found for ${oeNumber}`);
    return undefined;
  }

  const infoMsg = `OE NUMBER ID: ${oeNumber}`;
  logger.debugRequest(req, `Overseas Entity Retrieved - ${infoMsg}`);
  return response.resource;
};

export const getConfirmationStatementNextMadeUpToDateAsISoString = async (req: Request, oeNumber: string): Promise<string | undefined> => {
  const companyProfile: CompanyProfile | undefined = await getCompanyProfile(req, oeNumber);
  return companyProfile?.confirmationStatement?.nextMadeUpTo;
};
