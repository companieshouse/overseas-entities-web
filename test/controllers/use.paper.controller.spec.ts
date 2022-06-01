import { expect, test } from "@jest/globals";
import * as config from "../../src/config";
import request from "supertest";
import app from "../../src/app";

describe("USE PAPER controller", () => {
  describe("GET tests", () => {
    test(`renders the ${config.USE_PAPER_URL} page`, async () => {
      const resp = await request(app)
        .get(config.USE_PAPER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("You cannot use this service");
    });
  });
});
