import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { createOAuthApiClient } from "./api.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { getApplicationData } from "../utils/application.data";

export const createOverseasEntity = async (req: Request, session: Session, transactionId: string): Promise<string> => {
  const client = createOAuthApiClient(session);
  const response = await client.overseasEntity.postOverseasEntity(
    transactionId,
    getApplicationData(session)
  ) as any;

  if (response.httpStatusCode !== 201) {
    const errorMsg = `Something went wrong creating Overseas Entity, transactionId = ${transactionId} - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.debugRequest(req, `created Overseas Entity, ${JSON.stringify(response)}`);

  return response.resource.id;
};

export const updateOverseasEntity = async (req: Request, session: Session, transactionId: string): Promise<string> => {
  const client = createOAuthApiClient(session);
  const response = await client.overseasEntity.putOverseasEntity(
    transactionId,
    getApplicationData(session)
  ) as any;

  if (response.httpStatusCode !== 201) {
    const errorMsg = `Something went wrong with updating Overseas Entity, transactionId = ${transactionId} - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.debugRequest(req, `Updated Overseas Entity, ${JSON.stringify(response)}`);

  return response.resource.id;
};
