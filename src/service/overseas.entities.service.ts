import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { OverseasEntityCreated } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { Session } from "@companieshouse/node-session-handler";

import { createApiKeyClient } from "./api.service";
import { logger } from "../utils/logger";
import { getApplicationData } from "../utils/application.data";

export const createOverseasEntity = async (
  session: Session,
  transactionId: string
): Promise<Resource<OverseasEntityCreated> | ApiErrorResponse> => {
  try {
    const client = createApiKeyClient();
    return await client.overseasEntity.postOverseasEntity(
      transactionId,
      getApplicationData(session)
    );
  } catch (error) {
    logger.error(error);
    return error;
  }
};
