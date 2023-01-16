jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/authentication.middleware');

import { authentication } from "../../../src/middleware/authentication.middleware";
import request from "supertest";
import { NextFunction, Request, Response } from "express";
import app from "../../../src/app";
import { UPDATE_CONFIRMATION_URL } from "../../../src/config";
import { logger } from "../../../src/utils/logger";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  UPDATE_CONFIRMATION_PAGE_TITLE,
  UPDATE_CONFIRMATION_PAGE_REFERENCE_NUMBER
} from "../../__mocks__/text.mock";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("UPDATE CONFIRMATION controller", () => {

  test("renders the update confirmation page", async () => {
    const resp = await request(app).get(UPDATE_CONFIRMATION_URL);
    expect(resp.text).toContain(UPDATE_CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(UPDATE_CONFIRMATION_PAGE_REFERENCE_NUMBER);
  });

  test('catch error when page cannot be rendered', async () => {
    mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(UPDATE_CONFIRMATION_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
