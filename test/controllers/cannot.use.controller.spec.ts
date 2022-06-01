jest.mock("ioredis");

import { expect, test } from "@jest/globals";
import * as config from "../../src/config";
import request from "supertest";
import app from "../../src/app";
import { CANNOT_USE_SERVICE_HEADING } from "../__mocks__/text.mock";

describe("CANNOT USE controller", () => {
  describe("GET tests", () => {
    test(`renders the ${config.CANNOT_USE_PAGE} page`, async () => {
      const resp = await request(app)
        .get(config.CANNOT_USE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(CANNOT_USE_SERVICE_HEADING);
    });
  });
});
