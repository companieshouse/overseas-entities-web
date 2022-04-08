jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock('../../src/utils/application.data');

import { describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import { CHECK_YOUR_ANSWERS_URL } from "../../src/config";
import { CHECK_YOUR_ANSWERS_PAGE_TITLE } from "../__mocks__/text.mock";
import { authentication } from "../../src/controllers";
import { NextFunction, Request, Response } from "express";
import { getApplicationData } from "../../src/utils/application.data";
import {
  APPLICATION_DATA_MOCK,
  ENTITY_WITH_SERVICE_ADDRESS_OBJECT_MOCK,
  PRESENTER_OTHER_ROLE_OBJECT_MOCK
} from "../__mocks__/session.mock";
import { entityType, presenterType } from "../../src/model";
import { Presenter } from "../../src/model/presenter.model";

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const serviceAddressIsSameAsPrincipalAddress: string = "The correspondence address is the same as the principal or registered office address";

describe("GET tests", () => {
  test("renders the check your answers page with mock data (Other role)", async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const tempRole = APPLICATION_DATA_MOCK[presenterType.PresenterKey];
    APPLICATION_DATA_MOCK[presenterType.PresenterKey] = PRESENTER_OTHER_ROLE_OBJECT_MOCK;

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);
    APPLICATION_DATA_MOCK[presenterType.PresenterKey] = tempRole;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("fullName");
    expect(resp.text).toContain("roleTitle");
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain(serviceAddressIsSameAsPrincipalAddress);
    expect(resp.text).toContain("legalForm");
  });

  test("renders the check your answers page with mock data (undefined presenter)", async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const tempPresenter = APPLICATION_DATA_MOCK[presenterType.PresenterKey];
    APPLICATION_DATA_MOCK[presenterType.PresenterKey] = undefined;

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);
    APPLICATION_DATA_MOCK[presenterType.PresenterKey] = tempPresenter;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).not.toContain("fullName");
    expect(resp.text).not.toContain("roleTitle");
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain(serviceAddressIsSameAsPrincipalAddress);
    expect(resp.text).toContain("legalForm");
  });

  test("renders the check your answers page with mock data (undefined presenter role)", async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const tempPresenter = APPLICATION_DATA_MOCK[presenterType.PresenterKey];
    const presenter: Presenter = APPLICATION_DATA_MOCK[presenterType.PresenterKey] as Presenter;
    if (presenter) {
      presenter.role = undefined;
    }

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);
    APPLICATION_DATA_MOCK[presenterType.PresenterKey] = tempPresenter;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("fullName");
    expect(resp.text).not.toContain("roleTitle");
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain(serviceAddressIsSameAsPrincipalAddress);
    expect(resp.text).toContain("legalForm");
  });

  test("renders the check your answers page with mock data (service address same as principal address)", async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("fullName");
    expect(resp.text).toContain("Administrator");
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain(serviceAddressIsSameAsPrincipalAddress);
    expect(resp.text).toContain("legalForm");
  });

  test("renders the check your answers page with mock data (service address not same as principal address)", async () => {
    mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
    const tempAddress = APPLICATION_DATA_MOCK[entityType.EntityKey];
    APPLICATION_DATA_MOCK[entityType.EntityKey] = ENTITY_WITH_SERVICE_ADDRESS_OBJECT_MOCK;

    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);
    APPLICATION_DATA_MOCK[entityType.EntityKey] = tempAddress;

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
    expect(resp.text).toContain("fullName");
    expect(resp.text).toContain("Administrator");
    expect(resp.text).toContain("overseasEntityName");
    expect(resp.text).toContain("incorporationCountry");
    expect(resp.text).toContain("addressLine1");
    expect(resp.text).toContain("BY 2");
    expect(resp.text).toContain("serviceAddressLine1");
    expect(resp.text).toContain("SBY 2");
    expect(resp.text).toContain("legalForm");
  });


});
