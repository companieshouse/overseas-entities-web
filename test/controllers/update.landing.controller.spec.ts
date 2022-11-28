jest.mock("ioredis");
jest.mock("../../src/utils/application.data");

import { describe, expect, test, jest } from '@jest/globals';
import request from "supertest";

import app from "../../src/app";
import { UPDATE_LANDING_PAGE_URL, UPDATE_LANDING_URL } from "../../src/config";

describe("UPDATE LANDING controller", () => {

  test("renders the update landing page", async () => {
    const resp = await request(app).get(UPDATE_LANDING_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(UPDATE_LANDING_PAGE_URL);
  });
});
