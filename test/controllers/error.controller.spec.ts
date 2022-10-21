import { getLoggedInUserEmail } from "../../src/utils/session";

jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock("../../src/controllers/landing.controller");
jest.mock('../../src/utils/session');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import request from "supertest";
import app from "../../src/app";
import { logger } from "../../src/utils/logger";
import * as landingController from "../../src/controllers/landing.controller";
import * as config from "../../src/config";
import { EXPECTED_TEXT, INCORRECT_URL, MESSAGE_ERROR, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';
import { userMail } from "../__mocks__/session.mock";

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockGet = landingController.get as jest.Mock;
const mockGetLoggedInUserEmail = getLoggedInUserEmail as jest.Mock;

describe("ERROR controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLoggedInUserEmail.mockReturnValue(userMail);
  });

  test("Should return page not found screen if page url is not recognised", async () => {
    const response = await request(app).get(INCORRECT_URL);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.status).toEqual(404);
    expect(response.text).toContain(config.LANDING_PAGE_URL);
  });

  test("Should render the error page", async () => {
    mockGet.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
    const response = await request(app).get(config.LANDING_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(SERVICE_UNAVAILABLE);
    expect(response.text).toContain("/register-an-overseas-entity/sign-out?page=error-page");
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(MESSAGE_ERROR);
  });

});
