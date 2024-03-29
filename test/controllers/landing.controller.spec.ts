jest.mock("ioredis");
jest.mock("../../src/utils/application.data");

import { describe, expect, test, jest } from '@jest/globals';
import request from "supertest";

import app from "../../src/app";
import { LANDING_PAGE_URL, LANDING_URL } from "../../src/config";

describe("LANDING controller", () => {

  test("renders the landing page", async () => {
    const resp = await request(app).get(LANDING_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(LANDING_PAGE_URL);
  });
});
