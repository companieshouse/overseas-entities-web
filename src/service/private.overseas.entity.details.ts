import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { OverseasEntityExtraDetails } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";

export const getPrivateOeDetails = async (
  req: Request,
  oeNumber: string,
): Promise<OverseasEntityExtraDetails | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getOverseasEntityDetails",
    req,
    req.session as Session,
    oeNumber,
  );

  if (response.httpStatusCode !== 200 && response.httpStatusCode !== 404) {
    const errorMsg = `Something went wrong fetching company details = ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No company data found for ${oeNumber}`);
    return undefined;
  }

  const infoMsg = `OE NUMBER ID: ${oeNumber}`;
  logger.debugRequest(req, `Overseas Entity Data Retrieved - ${infoMsg}`);
  return response.resource;
};
