import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { Session } from "@companieshouse/node-session-handler";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

import { Request } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import { DESCRIPTION, REFERENCE } from "../config";
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { EntityNameKey, EntityNumberKey } from "../model/data.types.model";

export const postTransaction = async (req: Request, session: Session): Promise<string> => {
  const applicationData: ApplicationData = getApplicationData(session);
  const companyName = applicationData[EntityNameKey];
  const companyNumber = applicationData[EntityNumberKey];

  const transaction: Transaction = companyNumber === undefined ? { reference: REFERENCE, companyName, description: DESCRIPTION } : { reference: REFERENCE, companyName, companyNumber, description: DESCRIPTION };

  logger.infoRequest(req, `Calling 'postTransaction' for company number '${companyNumber}' with name '${companyName}'`);

  const response = await makeApiCallWithRetry(
    "transaction",
    "postTransaction",
    req,
    session,
    transaction
  );

  if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogErrorRequest(req, `'postTransaction' for company number '${companyNumber}' with name '${companyName}' returned HTTP status code ${response.httpStatusCode}`);
  } else if (!response.resource) {
    throw createAndLogErrorRequest(req, `'postTransaction' for company number '${companyNumber}' with name '${companyName}' returned no response`);
  }

  logger.infoRequest(req, `Response from 'postTransaction' for company number '${companyNumber}' with name '${companyName}': ${JSON.stringify(response)}`);

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

  logger.infoRequest(req, `Calling 'putTransaction' for transaction id '${transactionId}'`);

  const response = await makeApiCallWithRetry(
    "transaction",
    "putTransaction",
    req,
    session,
    transaction
  );

  if (!response) {
    throw createAndLogErrorRequest(req, `'putTransaction' for transaction id '${transactionId}' returned no response`);
  } else if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogErrorRequest(req, `'putTransaction' for transaction id '${transactionId}' returned HTTP status code ${response.httpStatusCode}`);
  }

  logger.infoRequest(req, `Response from 'putTransaction' for transaction id '${transactionId}': ${JSON.stringify(response)}`);

  return response;
};

export const getTransaction = async (
  req: Request,
  transactionId: string
): Promise<Transaction> => {

  logger.infoRequest(req, `Calling 'getTransaction' for transaction id '${transactionId}'`);

  const response = await makeApiCallWithRetry(
    "transaction",
    "getTransaction",
    req,
    req.session as Session,
    transactionId
  );

  if ( !response?.httpStatusCode ) {
    throw createAndLogErrorRequest(req, `'getTransaction' for transaction id '${transactionId}' returned incorrect response`);
  } else if ( response.httpStatusCode >= 400 ) {
    throw createAndLogErrorRequest(req, `'getTransaction' for transaction id '${transactionId}' returned HTTP status code ${response.httpStatusCode}`);
  } else if ( !response.resource ) {
    throw createAndLogErrorRequest(req, `'getTransaction' for transaction id '${transactionId}' returned no resource`);
  }

  logger.infoRequest(req, `Response from 'getTransaction' for transaction id '${transactionId}': ${JSON.stringify(response)}`);

  return response.resource;
};
