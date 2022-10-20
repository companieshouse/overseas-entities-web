import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { createOAuthApiClient } from "./api.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { getApplicationData } from "../utils/application.data";

export const createOverseasEntity = async (
  req: Request,
  session: Session,
  transactionId: string,
  // isSaveAndResume: boolean = false
): Promise<string> => {
  const client = createOAuthApiClient(session);

  const response = await client.overseasEntity.postOverseasEntity(
    transactionId,
    getApplicationData(session),
    // isSaveAndResume
  ) as any;

  if (response.httpStatusCode !== 201) {
    const errorMsg = `Something went wrong creating Overseas Entity, transactionId = ${transactionId} - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.debugRequest(req, `Created Overseas Entity, ${JSON.stringify(response)}`);

  return response.resource.id;
};
