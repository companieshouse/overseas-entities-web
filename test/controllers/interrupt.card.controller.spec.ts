jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/is.secure.register.middleware');
jest.mock("../../src/utils/feature.flag" );
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");

import { NextFunction, Request, Response } from "express";
import { expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";
import {
  INTERRUPT_CARD_PAGE,
  INTERRUPT_CARD_URL,
  INTERRUPT_CARD_WITH_PARAMS_URL,
  LANDING_PAGE_URL,
  OVERSEAS_NAME_URL,
  OVERSEAS_NAME_WITH_PARAMS_URL,
} from "../../src/config";
import { INTERRUPT_CARD_PAGE_TITLE } from "../__mocks__/text.mock";

import { authentication } from "../../src/middleware/authentication.middleware";
import { isSecureRegister } from "../../src/middleware/navigation/is.secure.register.middleware";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { getUrlWithParamsToPath, transactionIdAndSubmissionIdExistInRequest } from "../../src/utils/url";

const mockIsSecureRegisterMiddleware = isSecureRegister as jest.Mock;
mockIsSecureRegisterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const NEXT_PAGE_URL = "/NEXT_PAGE";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

const mockTransactionIdAndSubmissionIdExistInRequest = transactionIdAndSubmissionIdExistInRequest as jest.Mock;
mockTransactionIdAndSubmissionIdExistInRequest.mockReturnValue(true);

describe("INTERRUPT CARD controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the ${INTERRUPT_CARD_PAGE} page`, async () => {
      const resp = await request(app).get(INTERRUPT_CARD_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(INTERRUPT_CARD_PAGE_TITLE);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(OVERSEAS_NAME_URL);
    });

    test(`renders the ${INTERRUPT_CARD_PAGE} page with trust feature flag false`, async () => {
      (isActiveFeature as jest.Mock).mockReturnValue(false);

      const resp = await request(app).get(INTERRUPT_CARD_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(INTERRUPT_CARD_PAGE_TITLE);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain("Trusts");
    });
  });

  describe("GET with url params tests", () => {
    test(`renders the ${INTERRUPT_CARD_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);

      const resp = await request(app).get(INTERRUPT_CARD_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(INTERRUPT_CARD_PAGE_TITLE);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(OVERSEAS_NAME_WITH_PARAMS_URL);
    });

    test(`renders the ${INTERRUPT_CARD_PAGE} page with trust feature flag false`, async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).get(INTERRUPT_CARD_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(INTERRUPT_CARD_PAGE_TITLE);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain("Trusts");
    });
  });
});
