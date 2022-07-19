jest.mock("ioredis");

import { describe, expect, test, jest } from '@jest/globals';
import request from "supertest";

import app from "../../src/app";
import { ACCESSIBILITY_STATEMENT_PAGE, ACCESSIBILITY_STATEMENT_URL } from "../../src/config";
import { ACCESSIBILITY_STATEMENT_PAGE_HEADING } from '../__mocks__/text.mock';

describe("ACCESSIBILITY STATEMENT controller", () => {

  test(`renders the ${ACCESSIBILITY_STATEMENT_PAGE} page`, async () => {
    const resp = await request(app).get(ACCESSIBILITY_STATEMENT_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(ACCESSIBILITY_STATEMENT_PAGE_HEADING);
  });

});
