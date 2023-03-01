import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as config from "../../src/config";
import request from "supertest";
import app from "../../src/app";
import { SIGNED_OUT_PAGE_TITLE } from "../__mocks__/text.mock";

describe("Signed Out controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.SIGNED_OUT_PAGE} page`, async () => {
      const resp = await request(app)
        .get(`${config.SIGNED_OUT_URL}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGNED_OUT_PAGE_TITLE);
    });
  });
});
