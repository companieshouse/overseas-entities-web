jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.entity.middleware');

import { describe, expect, test, beforeEach, jest } from "@jest/globals";

import request from "supertest";
import { NextFunction, Request, Response } from "express";

import app from "../../src/app";
import * as config from "../../src/config";
import {
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  ERROR
} from "../__mocks__/session.mock";
import {
  BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING,
  SERVICE_UNAVAILABLE,
} from "../__mocks__/text.mock";
import { authentication } from "../../src/middleware/authentication.middleware";
import { getApplicationData } from "../../src/utils/application.data";
import { BeneficialOwnersStatementType } from "../../src/model/beneficial.owner.statement.model";
import { ErrorMessages } from "../../src/validation/error.messages";
import { hasEntity } from "../../src/middleware/navigation/has.entity.middleware";

const mockHasEntityMiddleware = hasEntity as jest.Mock;
mockHasEntityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("BENEFICIAL OWNER STATEMENTS controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("renders the beneficial owner statements page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test("redirects to the beneficial owner type page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ beneficial_owners_statement: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED);
      expect(resp.text).toContain(config.ENTITY_URL);
    });

    test("catch error when posting data", async () => {
      mockGetApplicationData.mockImplementationOnce(() =>  { throw ERROR; });
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ beneficial_owners_statement: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
