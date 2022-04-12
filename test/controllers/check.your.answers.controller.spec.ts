jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock('../../src/utils/application.data');

import { describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import { CHECK_YOUR_ANSWERS_URL } from "../../src/config";
import { CHECK_YOUR_ANSWERS_PAGE_TITLE, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";
import { authentication } from "../../src/controllers";
import { NextFunction, Request, Response } from "express";
import { getApplicationData } from "../../src/utils/application.data";
import {
  APPLICATION_DATA_MOCK, ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS
} from "../__mocks__/session.mock";
import { entityType } from "../../src/model";

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT = "The correspondence address is the same as the principal or registered office address";
const ERROR_MSG = "error";

describe("GET tests", () => {
  test("renders the check your answers page (Other role)", async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("fullName");
    expect(resp.text).toContain("roleTitle");
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain(SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT);
    expect(resp.text).toContain("legalForm");
  });

  test("renders the check your answers page (service address same as principal address)", async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain(SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS_TEXT);
  });

  test("renders the check your answers page (service address not same as principal address)", async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const tempEntity = APPLICATION_DATA_MOCK[entityType.EntityKey];
    APPLICATION_DATA_MOCK[entityType.EntityKey] = ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS;

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);
    APPLICATION_DATA_MOCK[entityType.EntityKey] = tempEntity;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("fullName");
    expect(resp.text).toContain("roleTitle");
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain("serviceAddressLine1");
    expect(resp.text).toContain("SBY 2");
    expect(resp.text).toContain("legalForm");
  });

  test("catch error when getting data", async () => {
    mockGetApplicationData.mockImplementationOnce(() =>  { throw new Error(ERROR_MSG); });
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

});
