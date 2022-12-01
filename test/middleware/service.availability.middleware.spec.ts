jest.mock("ioredis");
jest.mock("../../src/utils/feature.flag" );

import { describe, expect, test, beforeEach } from '@jest/globals';
import request from "supertest";
import app from "../../src/app";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("service availability middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    const response = await request(app).get("/register-an-overseas-entity");

    expect(response.text).toContain("Service offline - Register an overseas entity");
  });

  test("should not return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const response = await request(app).get("/register-an-overseas-entity");

    expect(response.text).not.toContain("Service offline - Register an overseas entity");
  });

  test("update request should return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false).mockReturnValueOnce(false);
    const response = await request(app).get("/update-an-overseas-entity");

    expect(response.text).toContain("Service offline - Register an overseas entity");
  });

  test("update request should not return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false).mockReturnValueOnce(true);
    const response = await request(app).get("/update-an-overseas-entity");

    expect(response.text).not.toContain("Service offline - Register an overseas entity");
  });
});
