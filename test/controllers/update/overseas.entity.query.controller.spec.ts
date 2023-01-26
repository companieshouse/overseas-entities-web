jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');

import { beforeEach, jest, test, describe } from "@jest/globals";

describe("OVERSEAS ENTITY QUERY controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders`, async () => {
    });
  });

  describe("POST tests", () => {
    test(`renders`, async () => {
    });
  });
});
