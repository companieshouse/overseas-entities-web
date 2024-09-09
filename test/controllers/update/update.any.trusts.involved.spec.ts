jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');
jest.mock("../../../src/utils/feature.flag" );

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import {
  UPDATE_ANY_TRUSTS_INVOLVED_URL,
  UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL,
  UPDATE_INTERRUPT_CARD_URL
} from "../../../src/config";
import app from "../../../src/app";
import {
  PAGE_TITLE_ERROR,
  UPDATE_ANY_TRUSTS_INVOLVED_HEADING,
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  RADIO_BUTTON_YES_SELECTED,
  RADIO_BUTTON_NO_SELECTED
} from "../../__mocks__/text.mock";
import { ErrorMessages } from '../../../src/validation/error.messages';
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { AnyTrustsInvolvedKey } from "../../../src/model/data.types.model";
import { isActiveFeature } from "../../../src/utils/feature.flag";

mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("Update any trusts involved controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the any trusts involved page`, async () => {
      const resp = await request(app).get(UPDATE_ANY_TRUSTS_INVOLVED_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ANY_TRUSTS_INVOLVED_HEADING);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_ANY_TRUSTS_INVOLVED_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to submit by paper page when yes is selected`, async () => {
      const resp = await request(app)
        .post(UPDATE_ANY_TRUSTS_INVOLVED_URL)
        .send({ [AnyTrustsInvolvedKey]: "1" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL);
    });

    test(`redirects to the update interrupt card page when no is selected`, async () => {
      const resp = await request(app)
        .post(UPDATE_ANY_TRUSTS_INVOLVED_URL)
        .send({ [AnyTrustsInvolvedKey]: "0" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_INTERRUPT_CARD_URL);
    });

    test("POST empty object and check for error in page title", async () => {
      const resp = await request(app).post(UPDATE_ANY_TRUSTS_INVOLVED_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UPDATE_ANY_TRUSTS_INVOLVED_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ANY_TRUSTS_INVOLVED);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_ANY_TRUSTS_INVOLVED_URL)
        .send({ [AnyTrustsInvolvedKey]: "1" });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
