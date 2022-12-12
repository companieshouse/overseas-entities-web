jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');

import { describe, expect, test, jest } from '@jest/globals';
import request from "supertest";
import app from "../../../src/app";
import { UPDATE_LANDING_PAGE_URL, UPDATE_LANDING_URL } from "../../../src/config";
import { logger } from "../../../src/utils/logger";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE
} from "../../__mocks__/text.mock";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("UPDATE LANDING controller", () => {

  test("renders the update landing page", async () => {
    const resp = await request(app).get(UPDATE_LANDING_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(UPDATE_LANDING_PAGE_URL);
  });

  test('catch error when rendering the page', async () => {
    mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(UPDATE_LANDING_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
