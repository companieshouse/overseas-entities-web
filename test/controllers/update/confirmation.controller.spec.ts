jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/session');

import { authentication } from "../../../src/middleware/authentication.middleware";
import request from "supertest";
import { NextFunction, Request, Response } from "express";
import app from "../../../src/app";
import { UPDATE_CONFIRMATION_URL, UPDATE_PAYMENT_FEE } from "../../../src/config";
import { logger } from "../../../src/utils/logger";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  UPDATE_CONFIRMATION_PAGE_TITLE,
  UPDATE_CONFIRMATION_PAGE_REFERENCE_NUMBER
} from "../../__mocks__/text.mock";
import { deleteApplicationData, getApplicationData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_MOCK, ENTITY_OBJECT_MOCK, getSessionRequestWithExtraData, userMail } from "../../__mocks__/session.mock";
import { get } from "../../../src/controllers/confirmation.controller";
import { getLoggedInUserEmail } from "../../../src/utils/session";

const req = {} as Request;
const res = { render: jest.fn() as any } as Response;

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockDeleteApplicationData = deleteApplicationData as jest.Mock;
const mockGetLoggedInUserEmail = getLoggedInUserEmail as jest.Mock;

const APPLICATION_TO_UPDATE_TEXT = "application to update an overseas entity";
const NOTICE_OF_UPDATE_TEXT = "notice of update to";
const UPDATE_FEE_TEXT = "update fee";

describe("UPDATE CONFIRMATION controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLoggedInUserEmail.mockReturnValue(userMail);
  });

  test("renders the update confirmation page", async () => {
    mockGetApplicationData.mockReturnValueOnce(
      { ...APPLICATION_DATA_MOCK }
    );

    const resp = await request(app).get(UPDATE_CONFIRMATION_URL);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(UPDATE_CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(UPDATE_CONFIRMATION_PAGE_REFERENCE_NUMBER);
    expect(resp.text).toContain(`£${UPDATE_PAYMENT_FEE}`);
    expect(resp.text).toContain(ENTITY_OBJECT_MOCK.email);
    expect(resp.text).toContain(userMail);
    expect(resp.text).toContain(APPLICATION_TO_UPDATE_TEXT);
    expect(resp.text).toContain(NOTICE_OF_UPDATE_TEXT);
    expect(resp.text).toContain(UPDATE_FEE_TEXT);
    expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
  });

  test('catch error when page cannot be rendered', async () => {
    mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(UPDATE_CONFIRMATION_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

  test("should test that deleteApplicationData does the work", () => {
    mockGetApplicationData.mockReturnValueOnce( { ...APPLICATION_DATA_MOCK } );
    req.session = getSessionRequestWithExtraData();

    get(req, res);

    const appData = getApplicationData(req.session);

    expect(appData).toBeFalsy;
    expect(res.render).toHaveBeenCalledTimes(1);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
  });
});
