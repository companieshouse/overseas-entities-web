import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { OverseasEntityExtraDetails, ManagingOfficersPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";

export const getPrivateOeDetails = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string,
): Promise<OverseasEntityExtraDetails | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getOverseasEntityDetails",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId,
  );

  if (response.httpStatusCode !== 200 && response.httpStatusCode !== 404) {
    const errorMsg = `Something went wrong fetching overseas entity details = ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No overseas entity details found ${overseasEntityId} under ${transactionId}`);
    return undefined;
  }

  return response.resource;
};

export const getManagingOfficerPrivateData = async (
  req: Request,
  transactionId?: string,
  overseasEntityId?: string
): Promise<ManagingOfficersPrivateData | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getManagingOfficerPrivateData",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId
  );

  if (response.httpStatusCode !== 200 && response.httpStatusCode !== 404) {
    const errorMsg = `Something went wrong fetching private MO details = ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No private MO details found ${overseasEntityId} under ${transactionId}`);
    return undefined;
  }

  logger.debugRequest(req, `${response}`);

  return response.resource;
};
