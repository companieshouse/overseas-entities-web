import { describe, expect, test } from '@jest/globals';
import request from "supertest";

import app from "../../src/app";
import { LANDING_URL } from "../../src/config";
import { INDEX_PAGE_TITLE } from '../__mocks__/text.mock';

describe("LANDING controller", () => {
  test("renders the landing page", async () => {
    // dispatch a request to the homepage using supertest
    const resp = await request(app).get(LANDING_URL);

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(INDEX_PAGE_TITLE);
  });
});
