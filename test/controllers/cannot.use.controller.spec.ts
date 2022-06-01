import { expect, test } from "@jest/globals";
import * as config from "../../src/config";
import request from "supertest";
import app from "../../src/app";

describe("CANNOT USE controller", () => {
  describe("GET tests", () => {
    test(`renders the ${config.CANNOT_USE_PAGE} page`, async () => {
      const resp = await request(app)
        .get(config.CANNOT_USE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("You cannot use this service");
    });
  });
});
