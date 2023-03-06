import { ACCOUNTS_SIGN_OUT_URL } from "../config";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { logger } from "../utils/logger";

export const signOutUser = async (req: Request, session: Session): Promise<string> => {

  const response = await makeApiCallWithRetry (
    "overseasEntity",
    "getSignOut",
    req,
    session,
    ACCOUNTS_SIGN_OUT_URL);

  logger.debugRequest(req, `Logged user out of overseas entities web, ${JSON.stringify(response)}`);

  return response;
};
