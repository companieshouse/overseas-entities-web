jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock('../../src/controllers/authentication.controller');

import { getApplicationData, prepareData, setApplicationData } from "../../src/utils/application.data";
import { logger } from "../../src/utils/logger";
import { authentication } from "../../src/controllers";
import { describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import { BENEFICIAL_OWNER_OTHER_URL, MANAGING_OFFICER_URL } from "../../src/config";
import { NextFunction, Request, Response } from "express";
import { MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";
import * as beneficialOwnerOtherController from "../../src/controllers/beneficial.owner.other.controller";
import { ENTITY_OBJECT_MOCK } from "../__mocks__/session.mock";

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
const mockGet = beneficialOwnerOtherController.get as jest.Mock;
const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;

mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const PAGE_TITLE = "Tell us about the corporate beneficial owner";

describe("BENEFICIAL OWNER OTHER controller", () => {

  test("renders the page through GET", async () => {
    mockGetApplicationData.mockImplementation( () => getApplicationData );
    const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL);

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(PAGE_TITLE);
  });

  test("Should render the error page", async () => {
    mockGet.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
    const response = await request(app).get(BENEFICIAL_OWNER_OTHER_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(SERVICE_UNAVAILABLE);
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(MESSAGE_ERROR);
  });

  test("posts the page and renders the managing-officer page through POST", async () => {
    mockPrepareData.mockImplementation( () => ENTITY_OBJECT_MOCK );
    mockSetApplicationData.mockImplementation( () => setApplicationData);
    const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL);

    // make some assertions on the response
    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(MANAGING_OFFICER_URL);
  });
});
