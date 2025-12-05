jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware');
jest.mock('../../src/utils/session');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/utils/url');

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { authentication } from "../../src/middleware/authentication.middleware";
import app from "../../src/app";
import * as config from "../../src/config";
import { get } from "../../src/controllers/confirmation.controller";
import { hasBOsOrMOs } from "../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware";
import { WhoIsRegisteringType } from "../../src/model/who.is.making.filing.model";
import { getLoggedInUserEmail } from "../../src/utils/session";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { isRegistrationJourney } from "../../src/utils/url";

import {
  deleteApplicationData,
  fetchApplicationData,
  getApplicationData
} from '../../src/utils/application.data';

import {
  OE01_PAYMENT_FEE,
  CONFIRMATION_URL,
  CONFIRMATION_WITH_PARAMS_URL,
} from "../../src/config";

import {
  CONFIRMATION_PAGE_TITLE,
  CONFIRMATION_NUMBER_OF_DAYS,
  CONFIRMATION_WHAT_YOU_NEED_TO_DO_NOW,
  CONFIRMATION_AGENT_MUST_THEN_COMPLETE_TEXT,
  CONFIRMATION_COMPLETED_IDENTITY_CHECKS_TEXT,
  CONFIRMATION_COMPLETED_VERIFICATION_CHECKS_TEXT
} from "../__mocks__/text.mock";

import {
  userMail,
  TRANSACTION_ID,
  ENTITY_OBJECT_MOCK,
  APPLICATION_DATA_MOCK,
  getSessionRequestWithExtraData,
} from "../__mocks__/session.mock";

const mockHasBOsOrMOsMiddleware = hasBOsOrMOs as jest.Mock;
mockHasBOsOrMOsMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockDeleteApplicationData = deleteApplicationData as jest.Mock;
const mockGetLoggedInUserEmail = getLoggedInUserEmail as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(true);

const req = {} as Request;
const res = { render: jest.fn() as any } as Response;

const APPLICATION_TO_REGISTER_TEXT = "application to register an overseas entity";
const NOTICE_OF_REGISTRATION_TEXT = "notice of registration to";
const REGISTRATION_FEE_TEXT = "registration fee";
const SURVEY_LINK = "roe-confirmation";

describe("Confirmation controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLoggedInUserEmail.mockReturnValue(userMail);
    mockIsRegistrationJourney.mockReset();
    mockIsActiveFeature.mockReset();
  });

  test("renders the confirmation page for non agent if the REDIS_removal flag is set to OFF", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockFetchApplicationData.mockReturnValue({
      ...APPLICATION_DATA_MOCK,
      who_is_registering: WhoIsRegisteringType.SOMEONE_ELSE,
    });
    const resp = await request(app).get(CONFIRMATION_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(TRANSACTION_ID);
    expect(resp.text).toContain(CONFIRMATION_NUMBER_OF_DAYS);
    expect(resp.text).toContain(CONFIRMATION_WHAT_YOU_NEED_TO_DO_NOW);
    expect(resp.text).toContain(ENTITY_OBJECT_MOCK.email);
    expect(resp.text).toContain(`£${OE01_PAYMENT_FEE}`);
    expect(resp.text).toContain(userMail);
    expect(resp.text).toContain(config.VF01_FORM_DOWNLOAD_URL);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
    expect(resp.text).toContain(APPLICATION_TO_REGISTER_TEXT);
    expect(resp.text).toContain(NOTICE_OF_REGISTRATION_TEXT);
    expect(resp.text).toContain(REGISTRATION_FEE_TEXT);
    expect(resp.text).toContain(SURVEY_LINK);
    expect(resp.text).toContain(CONFIRMATION_AGENT_MUST_THEN_COMPLETE_TEXT);
    expect(resp.text).toContain(CONFIRMATION_COMPLETED_VERIFICATION_CHECKS_TEXT);
    expect(resp.text).not.toContain(CONFIRMATION_COMPLETED_IDENTITY_CHECKS_TEXT);
    expect(mockIsRegistrationJourney).toHaveBeenCalledTimes(2);
    expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
  });

  test("renders the confirmation page for non agent if the REDIS_removal flag is set to ON", async () => {
    mockIsRegistrationJourney.mockReturnValue(true);
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockFetchApplicationData.mockReturnValue({
      ...APPLICATION_DATA_MOCK,
      who_is_registering: WhoIsRegisteringType.SOMEONE_ELSE,
    });
    const resp = await request(app).get(CONFIRMATION_WITH_PARAMS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(TRANSACTION_ID);
    expect(resp.text).toContain(CONFIRMATION_NUMBER_OF_DAYS);
    expect(resp.text).toContain(CONFIRMATION_WHAT_YOU_NEED_TO_DO_NOW);
    expect(resp.text).toContain(ENTITY_OBJECT_MOCK.email);
    expect(resp.text).toContain(`£${OE01_PAYMENT_FEE}`);
    expect(resp.text).toContain(userMail);
    expect(resp.text).toContain(config.VF01_FORM_DOWNLOAD_URL);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
    expect(resp.text).toContain(APPLICATION_TO_REGISTER_TEXT);
    expect(resp.text).toContain(NOTICE_OF_REGISTRATION_TEXT);
    expect(resp.text).toContain(REGISTRATION_FEE_TEXT);
    expect(resp.text).toContain(SURVEY_LINK);
    expect(resp.text).toContain(CONFIRMATION_AGENT_MUST_THEN_COMPLETE_TEXT);
    expect(resp.text).toContain(CONFIRMATION_COMPLETED_VERIFICATION_CHECKS_TEXT);
    expect(resp.text).not.toContain(CONFIRMATION_COMPLETED_IDENTITY_CHECKS_TEXT);
    expect(mockIsRegistrationJourney).toHaveBeenCalledTimes(2);
    expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
  });

  test("renders the confirmation page for agent", async () => {
    mockFetchApplicationData.mockReturnValue({
      ...APPLICATION_DATA_MOCK,
      who_is_registering: WhoIsRegisteringType.AGENT
    });
    const resp = await request(app).get(CONFIRMATION_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(ENTITY_OBJECT_MOCK.email);
    expect(resp.text).toContain(userMail);
    expect(resp.text).not.toContain(config.VF01_FORM_DOWNLOAD_URL);
    expect(resp.text).not.toContain(CONFIRMATION_WHAT_YOU_NEED_TO_DO_NOW);
    expect(resp.text).not.toContain(CONFIRMATION_NUMBER_OF_DAYS);
    expect(resp.text).toContain(APPLICATION_TO_REGISTER_TEXT);
    expect(resp.text).toContain(NOTICE_OF_REGISTRATION_TEXT);
    expect(resp.text).toContain(REGISTRATION_FEE_TEXT);
  });

  test("should test that deleteApplicationData does the work", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
    req.session = getSessionRequestWithExtraData();
    req.headers = {};
    await get(req, res);

    const appData = await getApplicationData(req.session);

    expect(appData).toBeFalsy; // Check extra data deleted
    expect(res.render).toHaveBeenCalledTimes(1);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
  });

});