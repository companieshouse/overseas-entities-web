import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import {
  BeneficialOwnerPrivateData,
  ManagingOfficerPrivateData,
  OverseasEntityExtraDetails
} from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";

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

  if (hasErrorResponse(req, response, overseasEntityId, transactionId, "overseas entity")) {
    return undefined;
  }

  return response.resource;
};

export const getBeneficialOwnersPrivateData = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string
): Promise<BeneficialOwnerPrivateData[] | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getBeneficialOwnersPrivateData",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId
  );

  if (hasErrorResponse(req, response, overseasEntityId, transactionId, "beneficial owner")) {
    return undefined;
  }

  return response.resource;
};

export const getManagingOfficerPrivateData = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string
): Promise<ManagingOfficerPrivateData[] | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getManagingOfficersPrivateData",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId
  );

  if (hasErrorResponse(req, response, overseasEntityId, transactionId, "managing officer")) {
    return undefined;
  }

  return response.resource;
};

const hasErrorResponse = (req: Request, response: any, overseasEntityId: string, transactionId: string, dataToRetrieve: string): boolean => {
  if (response.httpStatusCode !== 200 && response.httpStatusCode !== 404) {
    const errorMsg = `Something went wrong fetching private ${dataToRetrieve} details = ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No private ${dataToRetrieve} details found for ${overseasEntityId} under ${transactionId}`);
    return true;
  }

  return false;
};
