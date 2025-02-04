import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { fetchApplicationData } from "../utils/application.data";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { ApplicationData } from "../model/application.model";
import { isRegistrationJourney } from "../utils/url";
import { Transactionkey, OverseasEntityKey } from "../model/data.types.model";

export const createOverseasEntity = async (
  req: Request,
  session: Session,
  transactionId: string,
  data?: ApplicationData
): Promise<string> => {

  logger.infoRequest(req, `Calling 'postOverseasEntity' for transaction id '${transactionId}'`);

  const appData: ApplicationData = data ?? await fetchApplicationData(req, isRegistrationJourney(req));

  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "postOverseasEntity",
    req,
    session,
    transactionId,
    appData
  );

  if (response.httpStatusCode !== 201) {
    const errorMsg = `'postOverseasEntity' for transaction id '${transactionId}' encountered an error - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.infoRequest(req, `Response from 'postOverseasEntity' for transaction id '${transactionId}': ${JSON.stringify(response)}`);

  return response.resource.id;
};

export const updateOverseasEntity = async (req: Request, session: Session, data?: ApplicationData, forceUpdate: boolean = false) => {

  const appData: ApplicationData = data ?? await fetchApplicationData(req, isRegistrationJourney(req));
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
    appData,
    forceUpdate
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
  overseasEntityId: string,
  forceFetch: boolean = false
): Promise<ApplicationData> => {

  logger.infoRequest(req, `Calling 'getOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}'`);

  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getOverseasEntity",
    req,
    req.session as Session,
    transactionId,
    overseasEntityId,
    forceFetch
  );

  if (response.httpStatusCode !== 200) {
    const errorMsg = `'getOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}' encountered an error - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.infoRequest(req, `Response from 'getOverseasEntity' for transaction id '${transactionId}' and overseas entity id '${overseasEntityId}': ${JSON.stringify(response)}`);

  return response.resource;
};
