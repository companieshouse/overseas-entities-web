jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/service.availability.middleware');

import { beforeEach, jest, describe } from "@jest/globals";

describe("Confirm company data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Get confirm company profile", () => {
    test(`renders`, async () => {
    });
  });

  describe("Post confirm company profile", () => {
    test(`renders`, async () => {
    });
  });
});
