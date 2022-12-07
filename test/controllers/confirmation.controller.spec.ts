jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware');
jest.mock('../../src/utils/session');

import request from "supertest";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import { authentication } from "../../src/middleware/authentication.middleware";
import { NextFunction, Request, Response } from "express";

import app from "../../src/app";
import { CONFIRMATION_URL, PAYMENT_FEE } from "../../src/config";
import { CONFIRMATION_PAGE_TITLE, CONFIRMATION_NUMBER_OF_DAYS, CONFIRMATION_WHAT_YOU_NEED_TO_DO_NOW } from "../__mocks__/text.mock";
import { deleteApplicationData, getApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_MOCK, ENTITY_OBJECT_MOCK, getSessionRequestWithExtraData, TRANSACTION_ID, userMail } from "../__mocks__/session.mock";
import { get } from "../../src/controllers/confirmation.controller";
import { hasBOsOrMOs } from "../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware";
import { WhoIsRegisteringType } from "../../src/model/who.is.making.filing.model";
import { getLoggedInUserEmail } from "../../src/utils/session";
import * as config from "../../src/config";

const mockHasBOsOrMOsMiddleware = hasBOsOrMOs as jest.Mock;
mockHasBOsOrMOsMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockDeleteApplicationData = deleteApplicationData as jest.Mock;
const mockGetLoggedInUserEmail = getLoggedInUserEmail as jest.Mock;

const req = {} as Request;
const res = { render: jest.fn() as any } as Response;

describe("Confirmation controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLoggedInUserEmail.mockReturnValue(userMail);
  });

  test("renders the confirmation page for non agent", async () => {
    mockGetApplicationData.mockReturnValueOnce(
      { ...APPLICATION_DATA_MOCK,
        who_is_registering: WhoIsRegisteringType.SOMEONE_ELSE
      }
    );
    const resp = await request(app).get(CONFIRMATION_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(TRANSACTION_ID);
    expect(resp.text).toContain(CONFIRMATION_NUMBER_OF_DAYS);
    expect(resp.text).toContain(CONFIRMATION_WHAT_YOU_NEED_TO_DO_NOW);
    expect(resp.text).toContain(ENTITY_OBJECT_MOCK.email);
    expect(resp.text).toContain(`£${PAYMENT_FEE}`);
    expect(resp.text).toContain(userMail);
    expect(resp.text).toContain(config.VF01_FORM_DOWNLOAD_URL);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
  });

  test("renders the confirmation page for agent", async () => {
    mockGetApplicationData.mockReturnValueOnce(
      { ...APPLICATION_DATA_MOCK,
        who_is_registering: WhoIsRegisteringType.AGENT
      }
    );
    const resp = await request(app).get(CONFIRMATION_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(ENTITY_OBJECT_MOCK.email);
    expect(resp.text).toContain(userMail);
    expect(resp.text).not.toContain(config.VF01_FORM_DOWNLOAD_URL);
    expect(resp.text).not.toContain(CONFIRMATION_WHAT_YOU_NEED_TO_DO_NOW);
    expect(resp.text).not.toContain(CONFIRMATION_NUMBER_OF_DAYS);
  });

  test("should test that deleteApplicationData does the work", () => {
    mockGetApplicationData.mockReturnValueOnce( { ...APPLICATION_DATA_MOCK } );
    req.session = getSessionRequestWithExtraData();

    get(req, res);

    const appData = getApplicationData(req.session);

    expect(appData).toBeFalsy; // Check extra data deleted
    expect(res.render).toHaveBeenCalledTimes(1);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
  });

});
