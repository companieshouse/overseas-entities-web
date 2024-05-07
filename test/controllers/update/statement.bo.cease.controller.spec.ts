jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');

import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import { authentication } from "../../../src/middleware/authentication.middleware";
import app from "../../../src/app";
import * as config from "../../../src/config";
import { getApplicationData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { InputDate } from "../../../src/model/data.types.model";
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR, SERVICE_UNAVAILABLE, STATMENT_BO_CEASE_TITLE } from "../../__mocks__/text.mock";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { Update } from "../../../src/model/update.type.model";
import { saveAndContinue } from "../../../src/utils/save.and.continue";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe(`${config.UPDATE_STATEMENT_BO_CEASE_PAGE.toUpperCase()} controller`, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders ${config.UPDATE_STATEMENT_BO_CEASE_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(config.UPDATE_STATEMENT_BO_CEASE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(STATMENT_BO_CEASE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("The relevant period is between <strong>28 February 2022</strong> and <strong>");
      expect(resp.text).toContain("1");
      expect(resp.text).toContain("January");
      expect(resp.text).toContain("2011");
      expect(resp.text).toContain("No – the entity has <strong>no reasonable cause");
      expect(resp.text).toContain("Yes – the entity <strong>has reasonable cause");
      expect(resp.text).toContain("What information we’ll show on the public register");
    });

    test(`renders ${config.UPDATE_STATEMENT_BO_CEASE_PAGE} page test when registration date does not exist`, async () => {
      (APPLICATION_DATA_MOCK.update as Update).date_of_creation = {} as InputDate;
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(config.UPDATE_STATEMENT_BO_CEASE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(STATMENT_BO_CEASE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("The relevant period is between <strong>28 February 2022</strong> and <strong>");
      expect(resp.text).toContain("31");
      expect(resp.text).toContain("January");
      expect(resp.text).toContain("2023");
      expect(resp.text).toContain("No – the entity has <strong>no reasonable cause");
      expect(resp.text).toContain("Yes – the entity <strong>has reasonable cause");
      expect(resp.text).toContain("What information we’ll show on the public register");
    });

    test(`renders ${config.UPDATE_STATEMENT_BO_CEASE_PAGE} page when there is no application data`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_STATEMENT_BO_CEASE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });
  });
});
