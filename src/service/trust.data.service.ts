import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import {
  TrustData,
  TrustLinkData,
  IndividualTrusteeData,
  CorporateTrusteeData
} from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";

export const getTrustData = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string,
): Promise<TrustData[] | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getTrustData",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId,
  );

  if (hasErrorResponse(req, response, overseasEntityId, transactionId, "trust data")) {
    return undefined;
  }

  return response.resource;
};

export const getTrustLinks = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string
): Promise<TrustLinkData[] | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getTrustLinks",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId
  );

  if (hasErrorResponse(req, response, overseasEntityId, transactionId, "trust links")) {
    return undefined;
  }

  return response.resource;
};

export const getIndividualTrustees = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string,
  trustId: string
): Promise<IndividualTrusteeData[] | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getIndividualTrustees",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId,
    trustId
  );

  if (hasErrorResponse(req, response, overseasEntityId, transactionId, "individual trustees", trustId)) {
    return undefined;
  }

  return response.resource;
};

export const getCorporateTrustees = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string,
  trustId: string
): Promise<CorporateTrusteeData[] | undefined> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getCorporateTrustees",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId,
    trustId
  );

  if (hasErrorResponse(req, response, overseasEntityId, transactionId, "corporate trustees", trustId)) {
    return undefined;
  }

  return response.resource;
};

const hasErrorResponse = (req: Request, response: any,
                          overseasEntityId: string, transactionId: string,
                          trustDataToRetrieve: string, trustId?: string): boolean => {

  if (response.httpStatusCode !== 200 && response.httpStatusCode !== 404) {
    const errorMsg = `Something went wrong fetching ${trustDataToRetrieve} for ${overseasEntityId} under ${transactionId} = ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  if (response.httpStatusCode === 404) {
    if (trustId) {
      logger.debugRequest(req, `No ${trustDataToRetrieve} found for ${trustId} in ${overseasEntityId} under ${transactionId}`);
    } else {
      logger.debugRequest(req, `No ${trustDataToRetrieve} found for ${overseasEntityId} under ${transactionId}`);
    }
    return true;
  }

  return false;
};
