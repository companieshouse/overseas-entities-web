import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";

import { logger } from "../utils/logger";
import { refreshToken } from "./refresh.token.service";

/**
 * Unauthorised response handler for the Update and Create OE calls.
 * Retry the call after refreshing the token in the event of 401 unauthorised response.
 *
 * @param fn Callback function (postOverseasEntity or putOverseasEntity)
 * @param req Request object
 * @param session Session object
 * @param otherParams Parameters passed to the callback:
 *        For the postOverseasEntity call we have (transactionID, appData, isSaveAndResumeFeatureActive)
 *        For the putOverseasEntity call we have (transactionID, overseasEntityID, appData)
 *
 * @returns Promise< Resource<OverseasEntityCreated> | Resource<HttpStatusCode> | ApiErrorResponse >
 */
export const unauthorisedResponseHandler = async ( fn: Function, req: Request, session: Session, ...otherParams: any[] ) => {

  let response = await fn(...otherParams);

  if (response && response.httpStatusCode === 401){
    const errorMsg = "Retrying call after unauthorised response";
    logger.debugRequest(req, `${errorMsg} - ${JSON.stringify(response)}`);

    await refreshToken(req, session);
    response = await fn(...otherParams);
  }

  return response;
};
