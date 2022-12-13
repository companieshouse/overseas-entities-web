jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/is.secure.register.middleware');
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  PRESENTER_URL,
  LANDING_PAGE_URL,
  OVERSEAS_NAME_PAGE,
  OVERSEAS_NAME_URL,
  PRESENTER_PAGE,
} from "../../src/config";
import { getApplicationData } from "../../src/utils/application.data";
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  OVERSEAS_NAME_PAGE_TITLE,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SERVICE_UNAVAILABLE
} from '../__mocks__/text.mock';
import {
  APPLICATION_DATA_MOCK,
  OVERSEAS_ENTITY_ID,
  OVERSEAS_NAME_MOCK,
  TRANSACTION_ID
} from '../__mocks__/session.mock';
import { isSecureRegister } from "../../src/middleware/navigation/is.secure.register.middleware";
import { postTransaction } from "../../src/service/transaction.service";
import { createOverseasEntity, updateOverseasEntity } from "../../src/service/overseas.entities.service";
import { EntityNameKey, OverseasEntityKey, Transactionkey } from '../../src/model/data.types.model';

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockCreateOverseasEntity = createOverseasEntity as jest.Mock;
mockCreateOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockIsSecureRegisterMiddleware = isSecureRegister as jest.Mock;
mockIsSecureRegisterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue( APPLICATION_DATA_MOCK );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Overseas Name controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${OVERSEAS_NAME_PAGE} page with empty data`, async () => {
      mockGetApplicationData.mockReturnValueOnce(undefined);
      const resp = await request(app).get(OVERSEAS_NAME_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(OVERSEAS_NAME_PAGE_TITLE);
      expect(resp.text).not.toContain(OVERSEAS_NAME_MOCK);
    });

    test(`renders the ${OVERSEAS_NAME_PAGE} page with ${SAVE_AND_CONTINUE_BUTTON_TEXT} button`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [EntityNameKey]: OVERSEAS_NAME_MOCK });
      const resp = await request(app).get(OVERSEAS_NAME_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain(OVERSEAS_NAME_PAGE_TITLE);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("catch error when renders the presenter page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(OVERSEAS_NAME_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to the ${PRESENTER_PAGE} page after a successful post from ${OVERSEAS_NAME_PAGE} page`, async () => {
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${PRESENTER_URL}`);
    });

    test(`redirect to the ${PRESENTER_PAGE} page with transaction and overseas entity already created`, async () => {
      const mockData = { ...APPLICATION_DATA_MOCK };
      mockGetApplicationData.mockReturnValueOnce({}); // Needed at the setExtraData
      mockGetApplicationData.mockReturnValueOnce(mockData); // Needed inside the feature flag
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockTransactionService).not.toHaveBeenCalled();
      expect(mockCreateOverseasEntity).not.toHaveBeenCalled();

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${PRESENTER_URL}`);
    });

    test(`redirect to the ${PRESENTER_PAGE} page after a successful creation of transaction and overseas entity`, async () => {
      const mockData = { ...APPLICATION_DATA_MOCK, [Transactionkey]: "", [OverseasEntityKey]: "" };
      mockGetApplicationData.mockReturnValueOnce({}); // Needed at the setExtraData
      mockGetApplicationData.mockReturnValueOnce(mockData); // Needed inside the feature flag
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(mockData[Transactionkey]).toEqual(TRANSACTION_ID);
      expect(mockData[OverseasEntityKey]).toEqual(OVERSEAS_ENTITY_ID);
      expect(mockTransactionService).toHaveBeenCalledTimes(1);
      expect(mockCreateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${PRESENTER_URL}`);
    });

    test(`catch error when post data from ${OVERSEAS_NAME_PAGE} page`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
