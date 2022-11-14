import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";

import { logger } from "../utils/logger";
import { createOAuthApiClient } from "./api.service";
import { refreshToken } from "./refresh.token.service";

/**
 * Unauthorised response handler for the Update and Create OE calls.
 * Retry the call after refreshing the token in the event of 401 unauthorised response.
 *
 * @param fnName Function Name (postOverseasEntity or putOverseasEntity)
 * @param req Request object
 * @param session Session object
 * @param otherParams Parameters passed to the callback:
 *        For the postOverseasEntity call we have (transactionID, appData, isSaveAndResumeFeatureActive)
 *        For the putOverseasEntity call we have (transactionID, overseasEntityID, appData)
 *
 * @returns Promise< Resource<OverseasEntityCreated> | Resource<HttpStatusCode> | ApiErrorResponse >
 */
export const unauthorisedResponseHandler = async ( fnName: string, req: Request, session: Session, ...otherParams: any[] ) => {
  let client = createOAuthApiClient(session);

  let response = await client.overseasEntity[fnName](...otherParams);

  if (response && response.httpStatusCode === 401){

    const responseMsg = `Retrying ${fnName} call after unauthorised response`;
    logger.debugRequest(req, `${responseMsg} - ${JSON.stringify(response)}`);

    const accessToken = await refreshToken(req, session);
    logger.infoRequest(req, `New access token: ${accessToken}`);

    client = createOAuthApiClient(session);
    response = await client.overseasEntity[fnName](...otherParams);

  }

  return response;

};
