import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { createOAuthApiClient } from "./api.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { DESCRIPTION, REFERENCE } from "../config";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";

export const postTransaction = async (req: Request, session: Session): Promise<Transaction> => {
  const apiClient: ApiClient = createOAuthApiClient(session);

  const applicationData: ApplicationData = getApplicationData(session);

  const transaction: Transaction = { reference: REFERENCE, companyName: applicationData.entity?.name, description: DESCRIPTION };
  const response = await apiClient.transaction.postTransaction(transaction) as any;

  if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogErrorRequest(req, `Http status code ${response.httpStatusCode}`);
  } else if (!response.resource) {
    throw createAndLogErrorRequest(req, `POST - Transaction API request returned no response`);
  }

  logger.debugRequest(req, `Received transaction ${JSON.stringify(response)}`);

  return response.resource;
};

export const closeTransaction = async (
  req: Request,
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
    throw createAndLogErrorRequest(req, `PUT - Transaction API request returned no response`);
  } else if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    throw createAndLogErrorRequest(req, `Http status code ${response.httpStatusCode}`);
  }

  logger.debugRequest(req, `Closed transaction ${JSON.stringify(response)}`);

  return response;
};
