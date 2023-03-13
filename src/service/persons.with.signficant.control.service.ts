import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";

export const getCompanyPsc = async (
  req: Request,
  companyNumber: string,
): Promise<CompanyPersonsWithSignificantControl> => {
  const response = await makeApiCallWithRetry(
    "companyPsc",
    "getCompanyPsc",
    req,
    req.session as Session,
    companyNumber
  );

  if (response.httpStatusCode === 200) {
    logger.debugRequest(req, `Received company PSC data for ${companyNumber}`);
  } else if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No company PSC data found for ${companyNumber}`);
  } else {
    throw createAndLogErrorRequest(req, `getCompanyPsc API request returned HTTP status code ${response.httpStatusCode}`);
  }

  return response?.resource;
};
