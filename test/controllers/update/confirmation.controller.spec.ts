jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/session');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
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
  UPDATE_CONFIRMATION_PAGE_REFERENCE_NUMBER,
  CONFIRMATION_AGENT_SPECIFIC_TEXT,
  CONFIRMATION_UPDATE_TEXT
} from "../../__mocks__/text.mock";
import { deleteApplicationData, getApplicationData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_MOCK, APPLICATION_DATA_MOCK_WITHOUT_UPDATE, getSessionRequestWithExtraData, userMail } from "../../__mocks__/session.mock";
import { get } from "../../../src/controllers/confirmation.controller";
import { getLoggedInUserEmail } from "../../../src/utils/session";
import { hasBOsOrMOsUpdate } from "../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware";

const req = {} as Request;
const res = { render: jest.fn() as any } as Response;

mockRemoveJourneyMiddleware.mockClear();

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockHasBOsOrMOsUpdateMiddleware = hasBOsOrMOsUpdate as jest.Mock;
mockHasBOsOrMOsUpdateMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockDeleteApplicationData = deleteApplicationData as jest.Mock;
const mockGetLoggedInUserEmail = getLoggedInUserEmail as jest.Mock;

const UPDATE_STATEMENT_TEXT = "update statement";
const UPDATE_STATEMENT_WHAT_TO_DO_NOW = "What you need to do now";
const UPDATE_STATEMENT_WHAT_HAPPENS_NEXT = "What happens next";

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
    expect(resp.text).toContain(userMail);
    expect(resp.text).toContain(UPDATE_STATEMENT_TEXT);
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

  test("agent related content is not displayed for no change submission", async () => {
    mockGetApplicationData.mockReturnValueOnce(
      {
        ...APPLICATION_DATA_MOCK,
        who_is_registering: undefined,

        update: { no_change: true }
      } );
    const resp = await request(app).get(UPDATE_CONFIRMATION_URL);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(UPDATE_STATEMENT_TEXT);
    expect(resp.text).not.toContain(UPDATE_STATEMENT_WHAT_TO_DO_NOW);
    expect(resp.text).toContain(UPDATE_STATEMENT_WHAT_HAPPENS_NEXT);
    expect(resp.text).toContain(CONFIRMATION_UPDATE_TEXT);
  });

  test("agent related content is displayed for change submission", async () => {
    mockGetApplicationData.mockReturnValueOnce(
      {
        ...APPLICATION_DATA_MOCK_WITHOUT_UPDATE,
        who_is_registering: undefined,
        update: { no_change: false }
      } );
    const resp = await request(app).get(UPDATE_CONFIRMATION_URL);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(UPDATE_STATEMENT_TEXT);
    expect(resp.text).toContain(UPDATE_STATEMENT_WHAT_TO_DO_NOW);
    expect(resp.text).toContain(UPDATE_STATEMENT_WHAT_HAPPENS_NEXT);
    expect(resp.text).toContain(CONFIRMATION_AGENT_SPECIFIC_TEXT);
  });
});
