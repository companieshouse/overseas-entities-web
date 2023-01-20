import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { Session } from "@companieshouse/node-session-handler";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

import { Request } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import { DESCRIPTION, REFERENCE } from "../config";
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { EntityNameKey } from "../model/data.types.model";

export const postTransaction = async (req: Request, session: Session): Promise<string> => {
  const applicationData: ApplicationData = getApplicationData(session);
  const companyName = applicationData[EntityNameKey];

  const transaction: Transaction = { reference: REFERENCE, companyName, description: DESCRIPTION };

  const response = await makeApiCallWithRetry(
    "transaction",
    "postTransaction",
    req,
    session,
    transaction
  );

  if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogErrorRequest(req, `Http status code ${response.httpStatusCode}`);
  } else if (!response.resource) {
    throw createAndLogErrorRequest(req, `POST - Transaction API request returned no response`);
  }

  logger.debugRequest(req, `Received transaction ${JSON.stringify(response)}`);

  return response.resource.id;
};

export const closeTransaction = async (
  req: Request,
  session: Session,
  transactionId: string,
  overseasEntityId: string
): Promise<ApiResponse<Transaction>> => {

  const transaction: Transaction = {
    reference: `${REFERENCE}_${overseasEntityId}`,
    description: DESCRIPTION,
    id: transactionId,
    status: "closed"
  };

  const response = await makeApiCallWithRetry(
    "transaction",
    "putTransaction",
    req,
    session,
    transaction
  );

  if (!response) {
    throw createAndLogErrorRequest(req, `PUT - Transaction API request returned no response`);
  } else if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogErrorRequest(req, `Http status code ${response.httpStatusCode}`);
  }

  logger.debugRequest(req, `Closed transaction ${JSON.stringify(response)}`);

  return response;
};

export const getTransaction = async (
  req: Request,
  transactionId: string
): Promise<Transaction> => {

  const response = await makeApiCallWithRetry(
    "transaction",
    "getTransaction",
    req,
    req.session as Session,
    transactionId
  );

  if (!response || !response.resource) {
    throw createAndLogErrorRequest(req, `GET - Transaction API request returned no response`);
  } else if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogErrorRequest(req, `Http status code ${JSON.stringify(response)}`);
  }

  logger.debugRequest(req, `Getting transaction ${JSON.stringify(response)}`);

  return response.resource;
};
