import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

import { createApiKeyClient } from "./api.service";
import { createAndLogError, logger } from "../utils/logger";
import { DESCRIPTION, REFERENCE } from "../config";

export const postTransaction = async (): Promise<Transaction> => {
  const apiClient: ApiClient = createApiKeyClient();

  const transaction: Transaction = { reference: REFERENCE, description: DESCRIPTION };
  const response = await apiClient.transaction.postTransaction(transaction) as any;

  if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${response.httpStatusCode}`);
  } else if (!response.resource) {
    throw createAndLogError(`Transaction API POST request returned no response`);
  }

  logger.debug(`Received transaction ${JSON.stringify(response)}`);

  return response.resource;
};
