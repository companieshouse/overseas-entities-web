import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";

export const getCompanyPsc = async (
  req: Request,
  companyNumber: string,
): Promise<CompanyPersonsWithSignificantControlResource> => {
  const response = await makeApiCallWithRetry(
    "companyPsc",
    "getCompanyPsc",
    req,
    req.session as Session,
    companyNumber
  );

  if (response.httpStatusCode >= 400) {
    throw createAndLogErrorRequest(req, `getCompanyPsc API request returned HTTP status code ${response.httpStatusCode}`);
  }

  logger.debugRequest(req, `Received company PSC data for ${companyNumber}`);
  return response.resource;
};
