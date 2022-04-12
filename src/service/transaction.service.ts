import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { Session } from "@companieshouse/node-session-handler";

import { createOAuthApiClient } from "./api.service";
import { createAndLogError, logger } from "../utils/logger";
import { DESCRIPTION, REFERENCE } from "../config";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

export const postTransaction = async (session: Session): Promise<Transaction> => {
  const apiClient: ApiClient = createOAuthApiClient(session);

  const transaction: Transaction = { reference: REFERENCE, description: DESCRIPTION };
  const response = await apiClient.transaction.postTransaction(transaction) as any;

  if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${response.httpStatusCode}`);
  } else if (!response.resource) {
    throw createAndLogError(`POST - Transaction API request returned no response`);
  }

  logger.debug(`Received transaction ${JSON.stringify(response)}`);

  return response.resource;
};

export const closeTransaction = async (
  session: Session,
  transactionId: string,
  overseasEntityId: string
): Promise<ApiResponse<Transaction>> => {
  const apiClient: ApiClient = createOAuthApiClient(session);

  const transaction: Transaction = {
    reference: `${REFERENCE}_${overseasEntityId}`,
    description: DESCRIPTION,
    id: transactionId,
    status: "closed"
  };
  const response = await apiClient.transaction.putTransaction(transaction) as any;

  if (!response) {
    throw createAndLogError(`PUT - Transaction API request returned no response`);
  } else if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${response.httpStatusCode}`);
  }

  logger.debug(`Received transaction ${JSON.stringify(response)}`);

  return response;
};
