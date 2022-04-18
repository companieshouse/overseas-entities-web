import { OverseasEntityCreated } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { Session } from "@companieshouse/node-session-handler";

import { createOAuthApiClient } from "./api.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { getApplicationData } from "../utils/application.data";
import { Request } from "express";

export const createOverseasEntity = async (req: Request, session: Session, transactionId: string ): Promise<OverseasEntityCreated> => {
  const client = createOAuthApiClient(session);
  const response = await client.overseasEntity.postOverseasEntity(
    transactionId,
    getApplicationData(session)
  ) as any;

  if (response.httpStatusCode && [201, 400].indexOf(response.httpStatusCode) === -1) {
    const errorMsg = `Something went wrong creating Overseas Entity submission, transactionId = ${transactionId} - ${JSON.stringify(response)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.infoRequest(req, `Created Overseas Entity submission with id ${response.resource.id}`);

  return response.resource as OverseasEntityCreated;
};
