import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { makeApiCallWithRetry } from "./retry.handler.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { OverseasEntityExtraDetails } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { ApplicationData } from "../model/application.model";

export const hasRetrievedPrivateOeDetails = (appData: ApplicationData): boolean =>
  !!appData.entity?.email;

export const getPrivateOeDetails = async (
  req: Request,
  overseasEntityId: string,
): Promise<OverseasEntityExtraDetails> => {
  const response = await makeApiCallWithRetry(
    "overseasEntity",
    "getOverseasEntityDetails",
    req,
    req.session as Session,
    overseasEntityId,
  );

  const status = response.httpStatusCode;

  if (status !== 200 && status !== 404) {
    throw createAndLogErrorRequest(req, `Something went wrong fetching private overseas entity data for entity ${overseasEntityId} - ${JSON.stringify(response)}`);
  }

  if (status === 404 || !response.resource) {
    throw createAndLogErrorRequest(req, `No private overseas entity data found for entity ${overseasEntityId}`);
  }

  logger.debugRequest(req, `Private overseas entity data retrieved for entity ${overseasEntityId}`);
  return response.resource;
};
