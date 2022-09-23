import { OverseasEntityCreated } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { createOAuthApiClient } from "./api.service";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { getApplicationData } from "../utils/application.data";
import { getTransactionId } from "../utils/session";

export const createOverseasEntity = async (req: Request, session: Session, transactionId: string): Promise<OverseasEntityCreated> => {
  const client = createOAuthApiClient(session);
  const createResponse = await client.overseasEntity.postOverseasEntity(
    transactionId,
    getApplicationData(session)
  ) as any;

  if (createResponse.httpStatusCode !== 201) {
    const errorMsg = `Something went wrong creating Overseas Entity, transactionId = ${transactionId} - ${JSON.stringify(createResponse)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.debugRequest(req, `created Overseas Entity, ${JSON.stringify(createResponse)}`);

  return createResponse.resource as OverseasEntityCreated;
};

export const updateOverseasEntity = async (req: Request, session: Session, transactionId: string): Promise<OverseasEntityCreated> => {
  const client = createOAuthApiClient(session);
  const updateResponse = await client.overseasEntity.proofOfConceptPutOverseasEntity(
    transactionId,
    getApplicationData(session)
  ) as any;

  if (updateResponse.httpStatusCode !== 201) {
    const errorMsg = `Something went wrong updating Overseas Entity, transactionId = ${transactionId} - ${JSON.stringify(updateResponse)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.debugRequest(req, `updated Overseas Entity, ${JSON.stringify(updateResponse)}`);

  return updateResponse.resource as OverseasEntityCreated;
};

export const completeOverseasEntity = async (req: Request, session: Session, transactionId: string): Promise<void> => {
  const client = createOAuthApiClient(session);

  const patchResponse =  await client.overseasEntity.proofOfConceptPatchOverseasEntity(
    transactionId
  ) as any;

  if (patchResponse.httpStatusCode !== 202) {
    const errorMsg = `Something went wrong patching Overseas Entity, transactionId = ${transactionId} - ${JSON.stringify(patchResponse)}`;
    throw createAndLogErrorRequest(req, errorMsg);
  }

  logger.debugRequest(req, `completed Overseas Entity, ${JSON.stringify(patchResponse)}`);
};

/**
 * Added for POC save and resume
 * @param req
 */
export const updateSubmissionData = async (req: Request) => {
  const session = req.session as Session;

  //  get transaction id out of session
  const transactionId: string = getTransactionId(session);

  const overseaEntity: OverseasEntityCreated = await updateOverseasEntity(req, session, transactionId as string);
  logger.infoRequest(req, `Overseas Entity Updated, ID: ${overseaEntity.id}`);
};
