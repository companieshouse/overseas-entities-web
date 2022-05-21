jest.mock("ioredis");

import request from "supertest";
import app from "../../src/app";
import * as config from "../../src/config";

describe("HEALTHCHECK controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should return status code 200 and OK when healthcheck url is invoked", async () => {
    const response = await request(app).get(config.HEALTHCHECK_URL);
    expect(response.status).toEqual(200);
    expect(response.text).toContain("OK");
  });
});
