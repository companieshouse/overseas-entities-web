jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.overseas.name.middleware');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  PRESENTER_URL,
  LANDING_URL,
  WHO_IS_MAKING_FILING_PAGE,
  WHO_IS_MAKING_FILING_URL,
  LANDING_PAGE_URL,
} from "../../src/config";
import { getApplicationData, prepareData, setApplicationData } from "../../src/utils/application.data";
import { ApplicationDataType } from '../../src/model';
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  NOT_SHOW_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  PRESENTER_PAGE_TITLE,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SERVICE_UNAVAILABLE, USE_INFORMATION_NEED_MORE
} from '../__mocks__/text.mock';
import { PresenterKey } from '../../src/model/presenter.model';
import {
  EMAIL_ADDRESS,
  APPLICATION_DATA_MOCK,
  PRESENTER_OBJECT_MOCK,
  PRESENTER_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES
} from '../__mocks__/session.mock';
import { ErrorMessages } from '../../src/validation/error.messages';
import {
  PRESENTER_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK,
  PRESENTER_WITH_SPECIAL_CHARACTERS_FIELDS_MOCK
} from '../__mocks__/validation.mock';
import { hasOverseasName } from "../../src/middleware/navigation/has.overseas.name.middleware";
import { saveAndContinue } from "../../src/utils/save.and.continue";

const mockSaveAndContinue = saveAndContinue as jest.Mock;

const mockHasOverseasNameMiddleware = hasOverseasName as jest.Mock;
mockHasOverseasNameMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue( APPLICATION_DATA_MOCK );

const mockSetApplicationData = setApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockPrepareData = prepareData as jest.Mock;

describe("PRESENTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the presenter page with ${SAVE_AND_CONTINUE_BUTTON_TEXT} button`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [PresenterKey]: PRESENTER_OBJECT_MOCK });
      const resp = await request(app).get(PRESENTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(USE_INFORMATION_NEED_MORE);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_INFORMATION_ON_PUBLIC_REGISTER);
    });

    test("catch error when renders the presenter page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(PRESENTER_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to the ${WHO_IS_MAKING_FILING_PAGE} page after a successful post from presenter page`, async () => {
      const resp = await request(app).post(PRESENTER_URL).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${WHO_IS_MAKING_FILING_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`redirect to the ${WHO_IS_MAKING_FILING_PAGE} page after a successful post from presenter page with special characters`, async () => {
      const resp = await request(app).post(PRESENTER_URL).send(PRESENTER_WITH_SPECIAL_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${WHO_IS_MAKING_FILING_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(PRESENTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(LANDING_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(PRESENTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("renders the current page with MAX error messages", async () => {
      const resp = await request(app)
        .post(PRESENTER_URL)
        .send(PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MAX_FULL_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.FULL_NAME);
    });

    test("renders the current page with INVALID_CHARACTERS error message for full name and email", async () => {
      const resp = await request(app)
        .post(PRESENTER_URL)
        .send(PRESENTER_WITH_INVALID_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContainEqual(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
    });

    test("renders the next page and no errors are reported if email has leading and trailing spaces", async () => {
      const resp = await request(app)
        .post(PRESENTER_URL)
        .send(PRESENTER_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${WHO_IS_MAKING_FILING_URL}`);

      // Additionally check that email address is trimmed before it's saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["email"]).toEqual(EMAIL_ADDRESS);
    });

    test("catch error when post data from presenter page", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(PRESENTER_URL).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test("Test email is valid with long email address", async () => {
      const presenter = {
        ...PRESENTER_OBJECT_MOCK,
        email: "vsocarroll@QQQQQQQT123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const resp = await request(app)
        .post(PRESENTER_URL)
        .send(presenter);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("Test email is valid with long email name and address", async () => {
      const presenter = {
        ...PRESENTER_OBJECT_MOCK,
        email: "socarrollA123456789B132456798C123456798D123456789@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const resp = await request(app)
        .post(PRESENTER_URL)
        .send(presenter);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("Test email is valid with very long email name and address", async () => {
      const presenter = {
        ...PRESENTER_OBJECT_MOCK,
        email: "socarrollA123456789B132456798C123456798D123456789E123456789F123XX@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const resp = await request(app)
        .post(PRESENTER_URL)
        .send(presenter);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });
  });
});
