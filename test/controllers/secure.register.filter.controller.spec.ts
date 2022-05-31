import { APPLICATION_DATA_MOCK } from "../__mocks__/session.mock";
import request from "supertest";
import app from "../../src/app";
import * as config from "../../src/config";
import { beforeEach, expect, jest } from "@jest/globals";
import { BeneficialOwnersStatementType } from "../../src/model/beneficial.owner.statement.model";
import { getApplicationData } from "../../src/utils/application.data";
import { SECURE_REGISTER_FILTER_PAGE_HEADING } from "../__mocks__/text.mock";

const mockGetApplicationData = getApplicationData as jest.Mock;

describe( "SECURE REGISTER FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("renders the secure filter page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(config.LANDING_URL);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
    });
  });
});
