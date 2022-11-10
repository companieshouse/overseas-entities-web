import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";

import { ApplicationData } from "../model/application.model";
import { createAndLogErrorRequest } from "../utils/logger";
import { refreshToken } from "./refresh.token.service";

// type PostOverseasEntity = {
//     ( transactionId: string,  appData: ApplicationData, isSaveAndResumeFeatureActive: boolean ): any;
// };

// type PutOverseasEntity = {
//     ( transactionId: string, overseasEntityID: string, appData: ApplicationData): any;
// };

type PostOverseasEntityParams = [ transactionId: string,  appData: ApplicationData, isSaveAndResumeFeatureActive: boolean ];
type PostOverseasEntity = {
    ( ...arg: PostOverseasEntityParams ): any;
};

type PutOverseasEntityParams = [ transactionId: string, overseasEntityID: string, appData: ApplicationData ];
type PutOverseasEntity = {
    ( ...args: PutOverseasEntityParams ): any;
};
export const unauthorisedResponseHandler = async (
  fn: PostOverseasEntity | PutOverseasEntity, params: PostOverseasEntityParams | PutOverseasEntityParams, req: Request, session: Session) => {
  try {
    return await fn(...params);
  } catch (error) {
    if (error && error.status === 401){
      await refreshToken(req, session);
      return await fn(...params);
    } else {
      const errorMsg = `Error on retrying call after unauthorised response - ${JSON.stringify(error)}`;
      throw createAndLogErrorRequest(req, errorMsg);
    }
  }
};
