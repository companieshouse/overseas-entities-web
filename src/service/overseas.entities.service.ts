import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { getApplicationData } from "../utils/application.data";
import { Transactionkey, OverseasEntityKey } from "../model/data.types.model";
import { makeApiCallWithRetry } from "./retry.handler.service";

export const createOverseasEntity = async (
  req: Request,
  session: Session,
  transactionId: string,
  isSaveAndResumeFeatureActive: boolean = false
): Promise<string> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "postOverseasEntity",
    req,
    session,
    transactionId,
    getApplicationData(session),
    isSaveAndResumeFeatureActive
  );

  if (response.httpStatusCode !== 201) {
    const errorMsg = `Something went wrong creating Overseas Entity, transactionId = ${transactionId} - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.debugRequest(req, `Created Overseas Entity, ${JSON.stringify(response)}`);

  return response.resource.id;
};

export const updateOverseasEntity = async (req: Request, session: Session) => {
  const appData = getApplicationData(session);

  const transactionID = appData[Transactionkey] as string;
  const overseasEntityID = appData[OverseasEntityKey] as string;

  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "putOverseasEntity",
    req,
    session,
    transactionID,
    overseasEntityID,
    appData
  );

  if (response.httpStatusCode !== 200) {
    const errorContext = `Transaction Id: ${transactionID}, Overseas Entity Id: ${overseasEntityID}`;
    const errorMsg = `Something went wrong with updating Overseas Entity, ${errorContext}, Response: ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.debugRequest(req, `Updated Overseas Entity, ${JSON.stringify(response)}`);
};

export const getOverseasEntity = async (req: Request, session: Session) => {
  const appData = getApplicationData(session);

  const transactionID = appData[Transactionkey] as string;
  const overseasEntityID = appData[OverseasEntityKey] as string;

  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getOverseasEntity",
    req,
    session,
    transactionID,
    overseasEntityID,
    appData
  );
  if (response.httpStatusCode !== 200) {
    const errorContext = `Transaction Id: ${transactionID}, Overseas Entity Id: ${overseasEntityID}`;
    const errorMsg = `Something went wrong with updating Overseas Entity, ${errorContext}, Response: ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }
};
