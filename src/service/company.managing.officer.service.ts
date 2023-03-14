import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { CompanyOfficersResource } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { GET_COMPANY_OFFICERS_PAGE_SIZE } from '../config';

export const getCompanyOfficers = async (req: Request, companyNumber: string): Promise<CompanyOfficersResource | undefined> => {
  logger.debugRequest(req, `Retrieving list of officers for company: ${companyNumber}`);

  const response = await makeApiCallWithRetry(
    "companyOfficers",
    "getCompanyOfficers",
    req,
    req.session as Session,
    companyNumber,
    GET_COMPANY_OFFICERS_PAGE_SIZE
  );

  if (response.httpStatusCode === 200) {
    logger.debugRequest(req, `Retrieved officer data for company: ${companyNumber}`);
  } else if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No officer data found for company: ${companyNumber}`);
  } else {
    throw createAndLogErrorRequest(req, `getCompanyOfficers returned with status code: ${response.httpStatusCode}`);
  }

  return response?.resource;

};
