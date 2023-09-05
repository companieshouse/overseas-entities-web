import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import {
  BeneficialOwnersPrivateData,
  ManagingOfficersPrivateData,
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

  checkErrorResponse(req, response, overseasEntityId, transactionId, "overseas entity");

  return response.resource;
};

export const getBeneficialOwnerPrivateData = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string
): Promise<BeneficialOwnersPrivateData | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getBeneficialOwnerPrivateData",
    req,
      req.session as Session,
    transactionId,
    overseasEntityId
  );

  checkErrorResponse(req, response, overseasEntityId, transactionId, "beneficial owner");

  return response.resource;
};

export const getManagingOfficerPrivateData = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string
): Promise<ManagingOfficersPrivateData | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getManagingOfficersPrivateData",
    req,
      req.session as Session,
    transactionId,
    overseasEntityId
  );

  checkErrorResponse(req, response, overseasEntityId, transactionId, "managing officer");

  return response.resource;
};

const checkErrorResponse = (req: Request, response, overseasEntityId, transactionId, dataToRetrieve) => {
  if (response.httpStatusCode !== 200 && response.httpStatusCode !== 404) {
    const errorMsg = `Something went wrong fetching private ${dataToRetrieve} details = ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  if (response.httpStatusCode === 404) {
    logger.debugRequest(req, `No private ${dataToRetrieve} details found for ${overseasEntityId} under ${transactionId}`);
    return undefined;
  }
};
