jest.mock("../../src/utils/feature.flag" );

import request from "supertest";
import app from "../../src/app";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("service availability middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    const response = await request(app).get("/register-an-overseas-entity");

    expect(response.text).toContain("Service offline - Register an overseas entity");
  });

  it("should not return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const response = await request(app).get("/register-an-overseas-entity");

    expect(response.text).not.toContain("Service offline - Register an overseas entity");
  });
});
