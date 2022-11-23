jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/service/overseas.entities.service');
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/feature.flag" );
jest.mock("../../src/utils/logger");

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import {
  SOLD_LAND_FILTER_URL,
  SOLD_LAND_FILTER_PAGE,
  RESUME,
  OVERSEAS_ENTITY,
  TRANSACTION,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
} from "../../src/config";
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  SERVICE_UNAVAILABLE
} from '../__mocks__/text.mock';
import { APPLICATION_DATA_MOCK, OVERSEAS_ENTITY_ID, TRANSACTION_ID } from '../__mocks__/session.mock';
import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { authentication } from "../../src/middleware/authentication.middleware";
import { setExtraData } from "../../src/utils/application.data";
import { resumeOverseasEntity } from "../../src/service/overseas.entities.service";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from '../../src/model/who.is.making.filing.model';
import { DueDiligenceKey } from '../../src/model/due.diligence.model';
import { HasSoldLandKey, IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from '../../src/model/data.types.model';
import { OverseasEntityDueDiligenceKey } from '../../src/model/overseas.entity.due.diligence.model';
import { OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK } from '../__mocks__/overseas.entity.due.diligence.mock';

const mockSetExtraData = setExtraData as jest.Mock;
const mockInfoRequest = logger.infoRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue("Error on resuming OE");

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue( false );

const mockResumeOverseasEntity = resumeOverseasEntity as jest.Mock;
mockResumeOverseasEntity.mockReturnValue( APPLICATION_DATA_MOCK );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const MOCK_SAVE_AND_RESUME_URL = `${REGISTER_AN_OVERSEAS_ENTITY_URL}${TRANSACTION}/${TRANSACTION_ID}/${OVERSEAS_ENTITY}/${OVERSEAS_ENTITY_ID}/${RESUME}`;

describe("Save and Resume controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`Redirect to ${SOLD_LAND_FILTER_PAGE} page`, async () => {
    const resp = await request(app).get(MOCK_SAVE_AND_RESUME_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${SOLD_LAND_FILTER_URL}`);
    expect(mockResumeOverseasEntity).not.toHaveBeenCalled();
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockSetExtraData).not.toHaveBeenCalled();
  });

  test(`Redirect to ${SOLD_LAND_FILTER_PAGE} page after Resuming the OverseasEntity with DueDiligence object`, async () => {
    const mockAppData = {
      ...APPLICATION_DATA_MOCK,
      [OverseasEntityDueDiligenceKey]: {},
      [WhoIsRegisteringKey]: "",
      [OverseasEntityKey]: "",
      [Transactionkey]: "",
      [HasSoldLandKey]: "",
      [IsSecureRegisterKey]: "",
    };
    mockIsActiveFeature.mockReturnValueOnce( false );
    mockIsActiveFeature.mockReturnValueOnce( true );
    mockResumeOverseasEntity.mockReturnValueOnce( mockAppData );
    const resp = await request(app).get(MOCK_SAVE_AND_RESUME_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${SOLD_LAND_FILTER_URL}`);
    expect(mockAppData[WhoIsRegisteringKey]).toEqual(`${WhoIsRegisteringType.AGENT}`);
    expect(mockAppData[OverseasEntityKey]).toEqual(`${OVERSEAS_ENTITY_ID}`);
    expect(mockAppData[Transactionkey]).toEqual(`${TRANSACTION_ID}`);
    expect(mockAppData[HasSoldLandKey]).toEqual('0');
    expect(mockAppData[IsSecureRegisterKey]).toEqual('0');
    expect(mockResumeOverseasEntity).toHaveBeenCalledTimes(1);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockSetExtraData).toHaveBeenCalledTimes(1);
  });

  test(`Redirect to ${SOLD_LAND_FILTER_PAGE} page after Resuming the OverseasEntity with Overseas Entity DueDiligence object`, async () => {
    const mockAppData = {
      ...APPLICATION_DATA_MOCK,
      [DueDiligenceKey]: {},
      [OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
      [WhoIsRegisteringKey]: "",
      [OverseasEntityKey]: "",
      [Transactionkey]: "",
      [HasSoldLandKey]: "",
      [IsSecureRegisterKey]: "",
    };
    mockIsActiveFeature.mockReturnValueOnce( false );
    mockIsActiveFeature.mockReturnValueOnce( true );
    mockResumeOverseasEntity.mockReturnValueOnce( mockAppData );
    const resp = await request(app).get(MOCK_SAVE_AND_RESUME_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${SOLD_LAND_FILTER_URL}`);
    expect(mockAppData[WhoIsRegisteringKey]).toEqual(`${WhoIsRegisteringType.SOMEONE_ELSE}`);
    expect(mockAppData[OverseasEntityKey]).toEqual(`${OVERSEAS_ENTITY_ID}`);
    expect(mockAppData[Transactionkey]).toEqual(`${TRANSACTION_ID}`);
    expect(mockAppData[HasSoldLandKey]).toEqual('0');
    expect(mockAppData[IsSecureRegisterKey]).toEqual('0');
    expect(mockResumeOverseasEntity).toHaveBeenCalledTimes(1);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockSetExtraData).toHaveBeenCalledTimes(1);
  });

  test(`Should throw an error on Resuming the OverseasEntity`, async () => {
    mockIsActiveFeature.mockReturnValueOnce( false );
    mockIsActiveFeature.mockReturnValueOnce( true );
    mockResumeOverseasEntity.mockImplementationOnce( null as any );

    const errorMsg = `Error on resuming OE - Transaction ID: ${TRANSACTION_ID}, OverseasEntity ID: ${OVERSEAS_ENTITY_ID}`;
    const resp = await request(app).get(MOCK_SAVE_AND_RESUME_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    expect(mockResumeOverseasEntity).toHaveBeenCalledTimes(1);
    expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
    expect(mockCreateAndLogErrorRequest).toHaveBeenCalledWith( expect.anything(), errorMsg);

    expect(mockSetExtraData).not.toHaveBeenCalled();
  });

  test("Catch error when resuming Overseas Entity", async () => {
    mockInfoRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(MOCK_SAVE_AND_RESUME_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

});
