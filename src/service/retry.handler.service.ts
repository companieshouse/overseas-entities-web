import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";

import { logger } from "../utils/logger";
import { getAccessToken } from "../utils/session";
import { createOAuthApiClient } from "./api.service";
import { refreshToken } from "./refresh.token.service";

/**
 * Temporary local SDK wrapper, it needs to be done on node sdk manager!!!
 * Unauthorised response handler for the Update and Create of Overseas Entitys and Transactions.
 * Retry the call after refreshing the token in the event of 401 unauthorised response.
 *
 * @param serviceName Client Service Name (overseasEntity or transaction)
 * @param fnName Function Name
 * @param req Request object
 * @param session Session object
 * @param otherParams Parameters passed to the callback:
 *        For the postOverseasEntity call we have (transactionID, appData)
 *        For the putOverseasEntity call we have (transactionID, overseasEntityID, appData)
 *        For the getOverseasEntity call we have (transactionID, overseasEntityID)
 *        For the postTransaction call we have (transaction as Transaction)
 *        For the putTransaction call we have (transaction as Transaction)
 *        For the getTransaction call we have (transactionId)
 *
 * @returns Promise<
 *    ApiResponse<Transaction> |
 *    Resource<OverseasEntityCreated> |
 *    Resource<HttpStatusCode> |
 *    Resource<OverseasEntity> |
 *    ApiErrorResponse |
 *  >
 */
export const makeApiCallWithRetry = async (
  serviceName: string,
  fnName: string,
  req: Request,
  session: Session,
  ...otherParams: any[]
) => {

  logger.infoRequest(req, `Making a ${fnName} call on ${serviceName} service with token ${getAccessToken(session)}`);

  let client = createOAuthApiClient(session);

  let response = await client[serviceName][fnName](...otherParams);

  if (response && response.httpStatusCode === 401) {

    const responseMsg = `Retrying ${fnName} call on ${serviceName} service after unauthorised response`;
    logger.infoRequest(req, `${responseMsg} - ${JSON.stringify(response)}`);

    const accessToken = await refreshToken(req, session);
    logger.infoRequest(req, `New access token: ${accessToken}`);

    client = createOAuthApiClient(session);
    response = await client[serviceName][fnName](...otherParams);

  }

  logger.debugRequest(req, 'Call successful.');

  return response;

};
