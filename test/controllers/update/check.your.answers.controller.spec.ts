jest.mock("ioredis");
jest.mock('../../../src/service/transaction.service');
jest.mock('../../../src/service/overseas.entities.service');
jest.mock('../../../src/service/payment.service');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import {
  UPDATE_CHECK_YOUR_ANSWERS_PAGE,
  UPDATE_CHECK_YOUR_ANSWERS_URL
} from "../../../src/config";
import app from "../../../src/app";
import {
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE
} from "../../__mocks__/text.mock";
import {
  ERROR,
  OVERSEAS_ENTITY_ID,
  APPLICATION_DATA_MOCK,
  TRANSACTION_CLOSED_RESPONSE,
  PAYMENT_LINK_JOURNEY,
  TRANSACTION_ID
} from "../../__mocks__/session.mock";

import { authentication, companyAuthentication } from "../../../src/middleware/authentication.middleware";
import { postTransaction, closeTransaction } from "../../../src/service/transaction.service";
import { createOverseasEntity } from "../../../src/service/overseas.entities.service";
import { startPaymentsSession } from "../../../src/service/payment.service";
import { getApplicationData } from "../../../src/utils/application.data";

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;

mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockOverseasEntity = createOverseasEntity as jest.Mock;
mockOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

const mockCloseTransaction = closeTransaction as jest.Mock;
mockCloseTransaction.mockReturnValue( TRANSACTION_CLOSED_RESPONSE );

const mockPaymentsSession = startPaymentsSession as jest.Mock;
mockPaymentsSession.mockReturnValue( "CONFIRMATION_URL" );

describe("CHECK YOUR ANSWERS controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${PAYMENT_LINK_JOURNEY}, with transaction and OE id`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockPaymentsSession.mockReturnValueOnce(PAYMENT_LINK_JOURNEY);
      const resp = await request(app).post(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(PAYMENT_LINK_JOURNEY);
    });

    test(`catch error on POST action for ${UPDATE_CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
      mockOverseasEntity.mockImplementation(() => {
        throw ERROR;
      });
      const resp = await request(app).post(UPDATE_CHECK_YOUR_ANSWERS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
