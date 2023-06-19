jest.mock("ioredis");
jest.mock('../../../src/service/transaction.service');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/service/overseas.entities.service');
jest.mock('../../../src/service/payment.service');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/feature.flag" );

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import request from "supertest";
import app from "../../../src/app";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import { OverseasEntityKey, Transactionkey } from '../../../src/model/data.types.model';
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { postTransaction, closeTransaction } from "../../../src/service/transaction.service";
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { startPaymentsSession } from "../../../src/service/payment.service";
import { getApplicationData } from "../../../src/utils/application.data";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { APPLICATION_DATA_UPDATE_BO_MOCK, OVERSEAS_ENTITY_ID, TRANSACTION_CLOSED_RESPONSE, TRANSACTION_ID } from "../../__mocks__/session.mock";
import { UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL, UPDATE_REVIEW_STATEMENT_BEFORE_SUBMITTING_URL } from "../../../src/config";
import { NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE, NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT, UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS } from "../../__mocks__/text.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockOverseasEntity = updateOverseasEntity as jest.Mock;
mockOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

const mockCloseTransaction = closeTransaction as jest.Mock;
mockCloseTransaction.mockReturnValue( TRANSACTION_CLOSED_RESPONSE );

const mockPaymentsSession = startPaymentsSession as jest.Mock;
mockPaymentsSession.mockReturnValue( "CONFIRMATION_URL" );

describe("Update review overseas entity information controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("Thats review statement page is rendered", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_STATEMENT_BEFORE_SUBMITTING_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_CHECK_YOUR_ANSWERS_CONTACT_DETAILS);
      expect(resp.text).toContain(NO_CHANGE_REVIEW_STATEMENT_WHO_CAN_WE_CONTACT);
    });
  });
});