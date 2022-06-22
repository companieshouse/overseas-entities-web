jest.mock("ioredis");
jest.mock("../../src/utils/application.data");

import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import request from "supertest";

import app from "../../src/app";
import { LANDING_PAGE, LANDING_URL } from "../../src/config";
import { ANY_MESSAGE_ERROR, INDEX_PAGE_TITLE, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';
import { deleteApplicationData } from "../../src/utils/application.data";

const mockDeleteApplicationData = deleteApplicationData as jest.Mock;

describe("LANDING controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the landing page", async () => {
    const resp = await request(app).get(LANDING_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(INDEX_PAGE_TITLE);
  });

  test(`makes call to delete application data`, async () => {
    const resp = await request(app).get(LANDING_URL);

    expect(resp.status).toEqual(200);
    expect(mockDeleteApplicationData).toBeCalledTimes(1);
  });

  test(`catch error when renders the ${LANDING_PAGE} page on GET method`, async () => {
    mockDeleteApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(LANDING_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
