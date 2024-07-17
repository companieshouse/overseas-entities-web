import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import { getApplicationData } from "../utils/application.data";
import { Transactionkey, OverseasEntityKey } from "../model/data.types.model";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { ApplicationData } from "../model/application.model";

// TODO find all calls to this function and remove the isSaveAndResumeFeatureActive
// parameter when registration and update save and resume flags are removed
export const createOverseasEntity = async (
  req: Request,
  session: Session,
  transactionId: string,
  isSaveAndResumeFeatureActive: boolean
): Promise<string> => {

  logger.infoRequest(req, `Calling 'postOverseasEntity' for transaction id '${transactionId}'`);

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
    const errorMsg = `'postOverseasEntity' for transaction id '${transactionId}' encountered an error - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.infoRequest(req, `Response from 'postOverseasEntity' for transaction id '${transactionId}': ${JSON.stringify(response)}`);

  return response.resource.id;
};

export const updateOverseasEntity = async (req: Request, session: Session) => {
  const appData = getApplicationData(session);

  const transactionId = appData[Transactionkey] as string;
  const overseasEntityId = appData[OverseasEntityKey] as string;

  logger.infoRequest(req, `Calling 'putOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}'`);

  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "putOverseasEntity",
    req,
    session,
    transactionId,
    overseasEntityId,
    appData
  );

  if (response.httpStatusCode !== 200) {
    const errorMsg = `'putOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}' encountered an error - ${JSON.stringify(response)}`;

    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.infoRequest(req, `Response from 'putOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}': ${JSON.stringify(response)}`);
};

export const getOverseasEntity = async (
  req: Request,
  transactionId: string,
  overseasEntityId: string
): Promise<ApplicationData> => {

  logger.infoRequest(req, `Calling 'getOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}'`);

  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getOverseasEntity",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId
  );

  if (response.httpStatusCode !== 200) {
    const errorMsg = `'getOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}' encountered an error - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.infoRequest(req, `Response from 'getOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}': ${JSON.stringify(response)}`);

  return response.resource;
};
