jest.mock("../../src/utils/logger");
jest.mock("../../src/controllers/index.controller");

import request from "supertest";
import app from "../../src/app";
import { logger } from "../../src/utils/logger";
import * as indexController from "../../src/controllers/index.controller";
import * as config from "../../src/config";

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockGet = indexController.get as jest.Mock;

const EXPECTED_TEXT = "Page not found - Register an overseas entity and tell us about its beneficial owners";
const INCORRECT_URL = "/register-an-overseas-entity/company-numberr";

describe("Error controller test", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should return page not found screen if page url is not recognised", async () => {
    const response = await request(app)
      .get(INCORRECT_URL);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.status).toEqual(404);
  });

  it("Should render the error page", async () => {
    const message = "Can't connect";
    mockGet.mockImplementationOnce((_req: Request, _res: Response) => {
      throw new Error(message);
    });
    const response = await request(app)
      .get(config.LANDING_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, the service is unavailable");
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(message);
  });
});
