jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/feature.flag" );

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";

import { NextFunction, Request, Response } from "express";
import { expect, test, describe, jest } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";
import {
  UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL,
  UPDATE_ANY_TRUSTS_INVOLVED_URL,
  UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,

} from "../../../src/config";
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE_HEADING } from "../../__mocks__/text.mock";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { APPLICATION_DATA_UPDATE_BO_MO_MOCK } from "../../__mocks__/session.mock";
import { isActiveFeature } from "../../../src/utils/feature.flag";

mockJourneyDetectionMiddleware.mockClear();

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("Update trusts submit by paper controller", () => {
  describe("GET tests", () => {
    test("renders the trusts submit by paper page with back button to update-any-trusts-involved", async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      const resp = await request(app).get(UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE_HEADING);
      expect(resp.text).toContain(UPDATE_ANY_TRUSTS_INVOLVED_URL);
    });

    test("renders the trusts submit by paper page with back button to confirm-overseas-entity-details", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MO_MOCK);
      const resp = await request(app).get(UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE_HEADING);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
    });
  });
});
