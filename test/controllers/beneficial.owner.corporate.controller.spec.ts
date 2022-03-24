import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import { BENEFICIAL_OWNER_CORPORATE_URL } from "../../src/config";

const PAGE_TITLE = "Tell us about the corporate beneficial owner";

describe("Beneficial owner corproate controller", () => {
  test("renders the page", async () => {
    const resp = await request(app).get(BENEFICIAL_OWNER_CORPORATE_URL);

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(PAGE_TITLE);
  });
});
