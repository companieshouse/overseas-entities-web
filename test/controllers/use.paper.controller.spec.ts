jest.mock("ioredis");

import { expect, test } from "@jest/globals";
import * as config from "../../src/config";
import request from "supertest";
import app from "../../src/app";
import { CANNOT_USE_SERVICE_HEADING } from "../__mocks__/text.mock";

describe("USE PAPER controller", () => {
  describe("GET tests", () => {
    test(`renders the ${config.USE_PAPER_URL} page`, async () => {
      const resp = await request(app)
        .get(config.USE_PAPER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(CANNOT_USE_SERVICE_HEADING);
    });
  });
});
