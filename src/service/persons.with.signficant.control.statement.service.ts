import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { CompanyPersonsWithSignificantControlStatements } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements/types";

export const getCompanyPscStatements = async (
  req: Request,
  companyNumber: string,
): Promise<CompanyPersonsWithSignificantControlStatements> => {
  const response = await makeApiCallWithRetry(
    "companyPscStatements",
    "getCompanyPscStatements",
    req,
    req.session as Session,
    companyNumber
  );

  if (response.httpStatusCode === 200) {
    logger.debugRequest(req, `Received company PSC Statment data for ${companyNumber}`);
  } else if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No company PSC Statment data found for ${companyNumber}`);
  } else {
    throw createAndLogErrorRequest(req, `getCompanyPscStatements API request returned HTTP status code ${response.httpStatusCode}`);
  }
  return response?.resource;
};
