jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_MOCK, APPLICATION_DATA_MOCK_WITHOUT_UPDATE, COMPANY_NUMBER, OVERSEAS_NAME_MOCK } from '../../__mocks__/session.mock';
import { OVERSEAS_ENTITY_PAYMENT_WITH_TRANSACTION_URL, PAYMENT_WITH_TRANSACTION_URL, UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE, UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL, WHO_IS_MAKING_UPDATE_URL } from '../../../src/config';
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE, UPDATE_DO_YOU_WANT_TO_CHANGE_OE_NO_TEXT, UPDATE_DO_YOU_WANT_TO_CHANGE_OE_TITLE } from '../../__mocks__/text.mock';
import { logger } from '../../../src/utils/logger';
import { ErrorMessages } from '../../../src/validation/error.messages';
import { NoChangeKey } from '../../../src/model/update.type.model';

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe("Overseas entity do you want to change your OE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`that ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page is rendered`, async() => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain(COMPANY_NUMBER);
      expect(resp.text).toContain(UPDATE_DO_YOU_WANT_TO_CHANGE_OE_TITLE);
      expect(resp.text).toContain(UPDATE_DO_YOU_WANT_TO_CHANGE_OE_NO_TEXT);
    });

    test(`catch error when rendering ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test("setextra data is not called if no update model data", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK_WITHOUT_UPDATE,
      });
      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "0" });
      expect(resp.status).toEqual(302);
      expect(setExtraData).not.toHaveBeenCalled();
    });

    test(`redirect to ${WHO_IS_MAKING_UPDATE_URL} on YES selection`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "1" });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(WHO_IS_MAKING_UPDATE_URL);
      expect(mockSetExtraData).toBeCalledWith(
        undefined,
        expect.objectContaining({
          ...APPLICATION_DATA_MOCK
        }));
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`redirect to ${PAYMENT_WITH_TRANSACTION_URL} on NO selection`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "0" });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(OVERSEAS_ENTITY_PAYMENT_WITH_TRANSACTION_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("validation error when posting", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_OE_CHANGE);
    });

    test("catch error when posting the page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "NO" });
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
